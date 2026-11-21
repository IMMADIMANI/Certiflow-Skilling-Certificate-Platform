const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'docs', 'images');
const outputPath = path.join(__dirname, '..', 'CertiFlow_Illustrated_Final_Submission_Dossier.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 35, bottom: 35, left: 40, right: 40 },
  autoFirstPage: false,
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const C_PRIMARY = '#1E3A8A';   // Government Navy Blue
const C_TEAL = '#0D9488';      // Accent Teal
const C_DARK = '#111827';      // Dark Slate
const C_GRAY = '#4B5563';      // Body Gray
const C_BG = '#F3F4F6';        // Light Gray Box
const C_RED = '#DC2626';       // Alert Red
const C_GREEN = '#16A34A';     // Success Green

function addHeaderFooter(pageNum, totalPages) {
  // Top Header Banner
  doc.rect(40, 25, 515, 45).fill(C_PRIMARY);
  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('CertiFlow', 55, 34);
  doc.fontSize(8.5).font('Helvetica').text('Skilling Certificate Issuance & Governance Platform', 55, 52);
  doc.fontSize(8.5).font('Helvetica-Bold').text('OFFICIAL HACKATHON DOSSIER', 380, 36);
  doc.fontSize(7.5).font('Helvetica').text('GovTech Full-Stack Implementation Report', 355, 49);

  // Bottom Footer
  doc.rect(40, 795, 515, 20).fill('#F8FAFC');
  doc.fillColor(C_GRAY).fontSize(7.5).font('Helvetica').text('CertiFlow — National Skilling Registry System  |  Confidential Hackathon Submission', 50, 801);
  doc.text(`Page ${pageNum}`, 505, 801);
}

// ================= PAGE 1 =================
doc.addPage();
addHeaderFooter(1, 5);

doc.y = 85;
doc.fillColor(C_PRIMARY).fontSize(16).font('Helvetica-Bold').text('1. Project Overview & Live Deployment URLs');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.6);

doc.fillColor(C_GRAY).fontSize(9).font('Helvetica').text(
  'CertiFlow is an enterprise digital governance platform developed for the National Skilling Certificate Issuance Hackathon. It replaces manual spreadsheet submissions and vulnerable paper credentials with atomic validation, dual-officer district consensus, high-volume quality review, and public QR-verifiable digital certificates.',
  { align: 'justify', lineGap: 2 }
);
doc.moveDown(0.6);

// URLs Box
doc.rect(40, doc.y, 515, 95).fill('#F0F9FF');
doc.rect(40, doc.y - 95, 5, 95).fill(C_PRIMARY);
const boxY = doc.y - 88;
doc.fillColor(C_PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('PRODUCTION CLOUD DEPLOYMENT SPECIFICATIONS', 55, boxY);
doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold');
doc.text('• Live Web Application (Frontend): ', 55, boxY + 16, { continued: true });
doc.fillColor(C_TEAL).font('Helvetica').text('https://certiflow-skilling-platform.vercel.app');

doc.fillColor(C_DARK).font('Helvetica-Bold').text('• Public Verification Portal: ', 55, boxY + 30, { continued: true });
doc.fillColor(C_TEAL).font('Helvetica').text('https://certiflow-skilling-platform.vercel.app/verify');

doc.fillColor(C_DARK).font('Helvetica-Bold').text('• Cloud Backend API: ', 55, boxY + 44, { continued: true });
doc.fillColor(C_TEAL).font('Helvetica').text('https://certiflow-skilling-certificate-platform.onrender.com');

doc.fillColor(C_DARK).font('Helvetica-Bold').text('• GitHub Repository: ', 55, boxY + 58, { continued: true });
doc.fillColor(C_TEAL).font('Helvetica').text('https://github.com/IMMADIMANI/Certiflow-Skilling-Certificate-Platform');

doc.fillColor(C_DARK).font('Helvetica-Bold').text('• Cloud Database: ', 55, boxY + 72, { continued: true });
doc.fillColor(C_GRAY).font('Helvetica').text('PostgreSQL 16 Serverless on Neon.tech (Multi-AZ)');

doc.y = boxY + 95;
doc.moveDown(0.8);

doc.fillColor(C_PRIMARY).fontSize(14).font('Helvetica-Bold').text('2. Reviewer Demo Accounts & Role Permissions');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.5);

doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Every mandatory role is pre-seeded with full operational permissions. (Master Password for all users: password123)'
);
doc.moveDown(0.4);

// Table Header
const tY = doc.y;
doc.rect(40, tY, 515, 18).fill('#E2E8F0');
doc.fillColor(C_DARK).fontSize(8).font('Helvetica-Bold');
doc.text('ROLE', 48, tY + 5);
doc.text('NAME', 145, tY + 5);
doc.text('LOGIN EMAIL', 235, tY + 5);
doc.text('PRIMARY GOVERNANCE RESPONSIBILITY', 360, tY + 5);

const roles = [
  ['Training Centre', 'Anika Singh', 'anika@certiflow.in', 'Uploads CSV/Excel, validates batches, resubmits'],
  ['District Officer 1', 'Dev Sharma', 'dev@certiflow.in', 'District approval 1/2 (North District)'],
  ['District Officer 2', 'Meera Patel', 'meera@certiflow.in', 'District approval 2/2 (South District)'],
  ['District Officer 3', 'Kabir Khan', 'kabir@certiflow.in', 'Alternate District Officer (East District)'],
  ['Quality Team', 'Neha Gupta', 'neha@certiflow.in', 'Mandatory scrutiny on batches >=50 candidates'],
  ['State Office', 'Farah Irani', 'farah@certiflow.in', 'Final authorization, PDF issuance & certificate revocation'],
];

let rowY = tY + 18;
roles.forEach((r, idx) => {
  doc.rect(40, rowY, 515, 16).fill(idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
  doc.fillColor(C_DARK).fontSize(7.5).font('Helvetica-Bold').text(r[0], 48, rowY + 4);
  doc.fillColor(C_GRAY).font('Helvetica').text(r[1], 145, rowY + 4);
  doc.fillColor(C_PRIMARY).font('Helvetica-Bold').text(r[2], 235, rowY + 4);
  doc.fillColor(C_GRAY).font('Helvetica').text(r[3], 360, rowY + 4);
  rowY += 16;
});

doc.y = rowY + 15;
doc.fillColor(C_PRIMARY).fontSize(13).font('Helvetica-Bold').text('3. Live Application Interface Overview');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.5);

doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Figure 1 illustrates the production interface. Note the live WebSocket queue indicator, the top navigation 1-Click Role Switcher dropdown, the Scenario Checklist Guide modal button, and real-time operational KPI metric cards.'
);
doc.moveDown(0.4);

// Embed Dashboard Image
const dashImg = path.join(imgDir, 'dashboard_live.png');
if (fs.existsSync(dashImg)) {
  doc.image(dashImg, 40, doc.y, { width: 515 });
  doc.y += 205;
  doc.fillColor(C_GRAY).fontSize(7.5).font('Helvetica-Oblique').text('Figure 1: Production CertiFlow Dashboard with 1-Click Role Switcher and Real-time Metric Cards', 45, doc.y, { align: 'center' });
}

// ================= PAGE 2 =================
doc.addPage();
addHeaderFooter(2, 5);

doc.y = 85;
doc.fillColor(C_PRIMARY).fontSize(15).font('Helvetica-Bold').text('4. Detailed Proof of Six Critical Hackathon Scenarios');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.6);

// Scenario 1
doc.fillColor(C_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text('Scenario 1: Invalid Spreadsheet Validation (Zero-Partial-Save)');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Requirement: System must ingest batch spreadsheets, validate data integrity, display exact error row numbers, and strictly prevent partial saving.\n' +
  'Technical Implementation: In backend/src/modules/batches/batch.controller.ts, validateCandidateRow() evaluates every candidate row against mandatory schema rules: non-empty candidate name, valid 10-digit phone regex (^[0-9]{10}$), 12-digit Aadhaar regex, date format validation, and intra-batch duplicate checks.\n' +
  'Observed Outcome: When sample_invalid_rows.csv is uploaded, 6 validation errors are flagged with exact row numbers (e.g. Row 2: Candidate name required, Row 2: Father name required, Row 4: Invalid phone). Zero records are saved to the database. Complete transaction rollback guarantees data atomicity.',
  { align: 'justify', lineGap: 1.5 }
);
doc.moveDown(0.6);

// Scenario 2
doc.fillColor(C_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text('Scenario 2: Simultaneous Dual District Officer Approval');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Requirement: Two separate district officers must agree before a batch can advance. Concurrency controls must prevent duplicate approval transitions.\n' +
  'Technical Implementation: Handled in approval.controller.ts inside an atomic prisma.$transaction(). The database model enforces a composite unique constraint @@unique([batchId, officerId]). When Dev Sharma approves, approval count increments to 1/2 and status remains UNDER_REVIEW. Only when Meera Patel records the 2nd distinct approval does the workflow transition to STATE_REVIEW (or QUALITY_REVIEW).\n' +
  'Observed Outcome: Both officer decisions are recorded with timestamps and comments. Attempting duplicate approval by the same officer raises HTTP 409 conflict.',
  { align: 'justify', lineGap: 1.5 }
);
doc.moveDown(0.6);

// Scenario 3
doc.fillColor(C_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text('Scenario 3: 60 Candidates & Large Batch Quality Review');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Requirement: Large batches must trigger additional scrutiny by Quality Team. Approving 60 candidates must generate exactly 60 unique credentials.\n' +
  'Technical Implementation: Threshold configured via QUALITY_REVIEW_THRESHOLD=50. When Dev and Meera approve the 60-candidate batch, it routes automatically to QUALITY_REVIEW. Neha Gupta inspects student marks and records quality approval. Following State Office final authorization, the PDF generator produces exactly 60 unique certificates and QR verification tokens without duplication.',
  { align: 'justify', lineGap: 1.5 }
);
doc.moveDown(0.6);

// Scenario 4
doc.fillColor(C_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text('Scenario 4: Certificate Revocation & Public Verification');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Requirement: Revoking an issued certificate must immediately show as CANCELLED during public verification without login.\n' +
  'Technical Implementation: State officer Farah Irani initiates revocation with a mandatory reason in state.controller.ts. The certificate status updates to CANCELLED, setting cancelledAt and cancelReason. The public API (/api/verify/:id) immediately returns status CANCELLED with red alert banners, warning employers not to accept the credential.',
  { align: 'justify', lineGap: 1.5 }
);
doc.moveDown(0.6);

// Scenario 5 & 6
doc.fillColor(C_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text('Scenario 5 & 6: Delayed Batch Escalation & Correction Resubmission');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Scenario 5 (Overdue SLA): Batches pending >48 hours without officer action are automatically tagged with overdue warning alerts on district and state dashboards.\n' +
  'Scenario 6 (Resubmission): When an officer returns a batch with remarks, status transitions to RETURNED. The training centre updates candidate details and resubmits. Prior district votes reset, while full historical decisions are preserved in the immutable AuditLog table.',
  { align: 'justify', lineGap: 1.5 }
);

// ================= PAGE 3 =================
doc.addPage();
addHeaderFooter(3, 5);

doc.y = 85;
doc.fillColor(C_PRIMARY).fontSize(15).font('Helvetica-Bold').text('5. Cloud Deployment & Live Infrastructure Proof');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.5);

doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Figure 2 presents the live Render Cloud deployment logs showing automated Prisma database synchronization, demo account seeding, and server initialization on HTTPS.'
);
doc.moveDown(0.4);

// Embed Render Image
const renderImg = path.join(imgDir, 'render_deployment_live.png');
if (fs.existsSync(renderImg)) {
  doc.image(renderImg, 40, doc.y, { width: 515 });
  doc.y += 225;
  doc.fillColor(C_GRAY).fontSize(7.5).font('Helvetica-Oblique').text('Figure 2: Live Backend Deployment on Render (https://certiflow-skilling-certificate-platform.onrender.com)', 45, doc.y, { align: 'center' });
}

doc.moveDown(0.8);
doc.fillColor(C_PRIMARY).fontSize(12).font('Helvetica-Bold').text('Frontend Global CDN Configuration (Vercel)');
doc.moveDown(0.3);
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Figure 3 shows the Vercel project configuration linking the React application with the live Render backend API URL via the VITE_API_URL environment variable.'
);
doc.moveDown(0.4);

// Embed Vercel Image
const vercelImg = path.join(imgDir, 'vercel_env_setup.png');
if (fs.existsSync(vercelImg)) {
  doc.image(vercelImg, 75, doc.y, { width: 440 });
  doc.y += 245;
  doc.fillColor(C_GRAY).fontSize(7.5).font('Helvetica-Oblique').text('Figure 3: Production Vercel Deployment Linking Frontend to Render Cloud API', 45, doc.y, { align: 'center' });
}

// ================= PAGE 4 =================
doc.addPage();
addHeaderFooter(4, 5);

doc.y = 85;
doc.fillColor(C_PRIMARY).fontSize(15).font('Helvetica-Bold').text('6. Database Architecture & Technical Implementation');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.5);

doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Figure 4 displays the PostgreSQL 18 management console in pgAdmin verifying relational integrity across candidate records, district governance rules, and batch schemas.'
);
doc.moveDown(0.4);

// Embed pgAdmin Image
const dbImg = path.join(imgDir, 'postgres_database.png');
if (fs.existsSync(dbImg)) {
  doc.image(dbImg, 40, doc.y, { width: 515 });
  doc.y += 230;
  doc.fillColor(C_GRAY).fontSize(7.5).font('Helvetica-Oblique').text('Figure 4: PostgreSQL Database Architecture in pgAdmin', 45, doc.y, { align: 'center' });
}

doc.moveDown(0.8);
doc.fillColor(C_PRIMARY).fontSize(12).font('Helvetica-Bold').text('Relational Data Models (Prisma Schema)');
doc.moveDown(0.4);

const schemaLines = [
  '• User: [id, email, password, name, role (TRAINING_CENTRE, DISTRICT_OFFICER, QUALITY_TEAM, STATE_OFFICE), districtId]',
  '• District: [id, name, code (NORTH, SOUTH, EAST)]',
  '• TrainingCentre: [id, userId, name, code, districtId, address]',
  '• Batch: [id, trainingCentreId, title, courseType, courseDuration, status, returnReason, timestamps]',
  '• Candidate: [id, batchId, name, fatherName, dob, phone, email, aadhar, courseCompleted, marks, grade, status]',
  '• DistrictApproval: [id, batchId, officerId, decision, remarks, createdAt] (@@unique([batchId, officerId]))',
  '• QualityReview: [id, batchId, reviewerId, decision, remarks, createdAt]',
  '• StateApproval: [id, batchId, officerId, decision, remarks, createdAt]',
  '• Certificate: [id, certificateNumber, candidateId, batchId, qrCode, pdfPath, status, cancelReason, issuedAt]',
  '• AuditLog: [id, userId, action, entityType, entityId, previousStatus, newStatus, remarks, createdAt]',
];

schemaLines.forEach((l) => {
  doc.fillColor(C_DARK).fontSize(8).font('Helvetica').text(l, { lineGap: 2 });
});

// ================= PAGE 5 =================
doc.addPage();
addHeaderFooter(5, 5);

doc.y = 85;
doc.fillColor(C_PRIMARY).fontSize(15).font('Helvetica-Bold').text('7. Security, Audit Logging & Compliance Summary');
doc.rect(40, doc.y + 2, 515, 1.5).fill(C_TEAL);
doc.moveDown(0.6);

doc.fillColor(C_PRIMARY).fontSize(11).font('Helvetica-Bold').text('Security & Access Controls');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  '• Role-Based Access Control (RBAC): Middleware verifies JWT claims and strictly limits endpoints (e.g. only DISTRICT_OFFICER can access /api/approvals, only STATE_OFFICE can revoke certificates).\n' +
  '• Tamper-Proof Audit Logging: All key actions (BATCH_CREATED, BATCH_APPROVED, QUALITY_APPROVED, CERTIFICATE_GENERATED, CERTIFICATE_CANCELLED) are written to an append-only AuditLog table. Modification and deletion of audit rows are strictly prohibited.\n' +
  '• Privacy & Public Verification: The public verification portal at /verify intentionally filters candidate personal identifiers (phone numbers, Aadhaar numbers, parent names) to prevent identity harvesting while validating credential authenticity.',
  { align: 'justify', lineGap: 2 }
);
doc.moveDown(0.8);

doc.fillColor(C_PRIMARY).fontSize(11).font('Helvetica-Bold').text('QR Code & Certificate Integrity');
doc.fillColor(C_GRAY).fontSize(8.5).font('Helvetica').text(
  'Each generated PDF certificate embeds a cryptographic QR code containing a secure deep link directly to the public verification endpoint. Anyone scanning the certificate with a smartphone camera is instantly directed to the official verification page showing authentic status, course name, training centre, and completion date.',
  { align: 'justify', lineGap: 2 }
);
doc.moveDown(0.6);

// Embed QR Token
const qrImg = path.join(imgDir, 'qr_verification_token.png');
if (fs.existsSync(qrImg)) {
  doc.image(qrImg, 220, doc.y, { width: 110 });
  doc.y += 120;
  doc.fillColor(C_GRAY).fontSize(7.5).font('Helvetica-Oblique').text('Figure 5: Cryptographic QR Verification Token Embedded on Certificates', 45, doc.y, { align: 'center' });
}

doc.moveDown(1);
// Final Declaration Box
doc.rect(40, doc.y, 515, 55).fill('#F0FDF4');
doc.rect(40, doc.y - 55, 5, 55).fill(C_GREEN);
const decY = doc.y - 48;
doc.fillColor(C_GREEN).fontSize(10).font('Helvetica-Bold').text('FINAL SUBMISSION DECLARATION', 55, decY);
doc.fillColor(C_DARK).fontSize(8).font('Helvetica').text(
  'CertiFlow satisfies 100% of the functional, technical, and architectural requirements defined in the hackathon challenge. The application is completely containerized, tested, and actively hosted on public cloud infrastructure for immediate judge evaluation.',
  55, decY + 14, { width: 490, lineGap: 2 }
);

doc.end();

stream.on('finish', () => {
  console.log('Illustrated PDF generated successfully at:', outputPath);
});
