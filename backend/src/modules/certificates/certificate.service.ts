import prisma from '../../config/database';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

function generateCertNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CERT-${year}-${random}`;
}

export async function generateCertificatesForBatch(batchId: string): Promise<void> {
  console.log(`[Cert] Starting certificate generation for batch ${batchId}`);

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { candidates: true, trainingCentre: true },
  });
  if (!batch) { console.error('[Cert] Batch not found'); return; }

  const certDir = path.join(process.cwd(), 'certificates');
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  let generated = 0;
  for (const candidate of batch.candidates) {
    // IDEMPOTENCY: skip if already has a certificate
    const existing = await prisma.certificate.findUnique({ where: { candidateId: candidate.id } });
    if (existing) { console.log(`[Cert] Skipping ${candidate.name} - already has certificate`); continue; }

    const certNumber = generateCertNumber();
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certNumber}`;

    // Generate QR code as base64
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 150, margin: 1 });

    // Generate PDF
    const pdfFileName = `${certNumber}.pdf`;
    const pdfPath = path.join(certDir, pdfFileName);

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      const W = doc.page.width;
      const H = doc.page.height;

      // Background
      doc.rect(0, 0, W, H).fill('#f8faff');

      // Outer border
      doc.rect(15, 15, W - 30, H - 30).lineWidth(4).strokeColor('#1e40af').stroke();
      // Inner border
      doc.rect(22, 22, W - 44, H - 44).lineWidth(1).strokeColor('#93c5fd').stroke();

      // Header banner
      doc.rect(15, 15, W - 30, 70).fill('#1e40af');

      doc.fillColor('#ffffff').fontSize(10).font('Helvetica')
        .text('GOVERNMENT OF INDIA', 30, 28, { align: 'center' });
      doc.fontSize(20).font('Helvetica-Bold')
        .text('CERTIFICATE OF SKILL COMPLETION', 30, 44, { align: 'center' });

      // Decorative line
      doc.moveTo(50, 90).lineTo(W - 50, 90).lineWidth(1).strokeColor('#bfdbfe').stroke();

      // Body text
      doc.fillColor('#374151').fontSize(13).font('Helvetica')
        .text('This is to certify that', 0, 108, { align: 'center' });

      // Candidate Name
      doc.fillColor('#111827').fontSize(28).font('Helvetica-Bold')
        .text(candidate.name.toUpperCase(), 0, 128, { align: 'center' });

      doc.fillColor('#4b5563').fontSize(12).font('Helvetica')
        .text(`S/o D/o: ${candidate.fatherName}`, 0, 165, { align: 'center' });

      doc.fillColor('#374151').fontSize(13)
        .text('has successfully completed the course in', 0, 190, { align: 'center' });

      // Course Name
      doc.fillColor('#1e40af').fontSize(22).font('Helvetica-Bold')
        .text(candidate.courseCompleted, 0, 212, { align: 'center' });

      doc.fillColor('#374151').fontSize(12).font('Helvetica')
        .text(`at  ${batch.trainingCentre.name}`, 0, 248, { align: 'center' });

      doc.text(
        `Completion Date: ${candidate.completionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        0, 270, { align: 'center' }
      );

      if (candidate.grade) {
        doc.text(`Grade: ${candidate.grade}${candidate.marks ? `  (${candidate.marks}%)` : ''}`, 0, 290, { align: 'center' });
      }

      // Divider
      doc.moveTo(50, 315).lineTo(W - 50, 315).lineWidth(0.5).strokeColor('#d1d5db').stroke();

      // Certificate number
      doc.fillColor('#6b7280').fontSize(9).font('Helvetica')
        .text(`Certificate No: ${certNumber}`, 50, 325)
        .text(`Issue Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 338);

      // QR Code
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, W - 145, H - 150, { width: 110, height: 110 });
      doc.fillColor('#9ca3af').fontSize(7)
        .text('Scan to verify', W - 145, H - 35, { width: 110, align: 'center' });

      // Authorised signature line
      doc.moveTo(50, H - 60).lineTo(200, H - 60).lineWidth(0.5).strokeColor('#374151').stroke();
      doc.fillColor('#374151').fontSize(10).text('Authorised Signatory', 50, H - 52);
      doc.text('State Skill Development Authority', 50, H - 40);

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Save to DB
    const cert = await prisma.certificate.create({
      data: {
        candidateId: candidate.id,
        batchId,
        certificateNumber: certNumber,
        pdfPath: `certificates/${pdfFileName}`,
        qrCode: qrDataUrl,
        status: 'ACTIVE',
      },
    });

    // Update candidate status
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: 'CERTIFIED', certificateId: cert.id },
    });

    generated++;
    console.log(`[Cert] Generated certificate ${certNumber} for ${candidate.name}`);

    // Send WhatsApp notification (async, non-blocking)
    sendWhatsAppNotification(candidate, cert).catch(console.error);
  }

  console.log(`[Cert] Done. Generated ${generated} certificates for batch ${batchId}`);
}

async function sendWhatsAppNotification(candidate: any, certificate: any): Promise<void> {
  // Check idempotency
  const existing = await prisma.notification.findUnique({
    where: { candidateId_channel: { candidateId: candidate.id, channel: 'WHATSAPP' } },
  });
  if (existing?.status === 'SENT') return;

  let notif = existing;
  if (!notif) {
    notif = await prisma.notification.create({
      data: {
        candidateId: candidate.id,
        certificateId: certificate.id,
        channel: 'WHATSAPP',
        status: 'PENDING',
        attempts: 0,
      },
    });
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.notification.update({
        where: { id: notif!.id },
        data: { status: 'RETRYING', attempts: attempt, lastAttempt: new Date() },
      });

      // Simulate WhatsApp delivery
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 300));
      const roll = Math.random();
      if (roll < 0.1) throw new Error('Gateway timeout');
      if (roll < 0.2) throw new Error('Delivery failed');

      // Success
      await prisma.notification.update({
        where: { id: notif!.id },
        data: { status: 'SENT', deliveredAt: new Date() },
      });
      console.log(`[WhatsApp] ✓ Sent to ${candidate.phone} (cert: ${certificate.certificateNumber})`);
      return;
    } catch (err: any) {
      console.log(`[WhatsApp] ✗ Attempt ${attempt}/${maxRetries} failed for ${candidate.phone}: ${err.message}`);
      if (attempt === maxRetries) {
        await prisma.notification.update({
          where: { id: notif!.id },
          data: { status: 'FAILED' },
        });
        console.log(`[WhatsApp] All retries exhausted for ${candidate.phone}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // exponential backoff
    }
  }
}
