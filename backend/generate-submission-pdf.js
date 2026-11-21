const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
});

const outputPath = path.join(__dirname, '..', 'CertiFlow_Final_Hackathon_Submission_Document.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors
const primary = '#1E3A8A';   // Deep Blue
const secondary = '#0D9488'; // Teal
const dark = '#1F2937';      // Slate Dark
const gray = '#4B5563';      // Muted Gray
const red = '#B91C1C';       // Crimson
const lightBg = '#F3F4F6';

function drawHeader() {
  doc.rect(40, 30, 515, 60).fill('#1E3A8A');
  doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('CertiFlow', 55, 42);
  doc.fontSize(10).font('Helvetica').text('Skilling Certificate Issuance & Verification Platform', 55, 66);
  doc.fontSize(9).font('Helvetica-Bold').text('HACKATHON FINAL SUBMISSION DOCUMENT', 330, 52);
  doc.fontSize(8).font('Helvetica').text('Official Project Dossier & Technical Report', 345, 66);
  doc.moveDown(2);
}

function sectionTitle(title) {
  doc.moveDown(0.8);
  doc.fillColor(primary).fontSize(14).font('Helvetica-Bold').text(title);
  doc.rect(45, doc.y + 2, 505, 1.5).fill(secondary);
  doc.moveDown(0.5);
}

function subsectionTitle(title) {
  doc.moveDown(0.4);
  doc.fillColor(dark).fontSize(11).font('Helvetica-Bold').text(title);
  doc.moveDown(0.2);
}

function bodyText(text) {
  doc.fillColor(gray).fontSize(9.5).font('Helvetica').text(text, { align: 'justify', lineGap: 2 });
}

function bullet(title, text) {
  doc.fillColor(dark).fontSize(9).font('Helvetica-Bold').text(`• ${title}: `, { continued: true });
  doc.fillColor(gray).font('Helvetica').text(text);
}

drawHeader();

// --- 1. PROJECT OVERVIEW ---
sectionTitle('1. Project Overview & Problem Statement');
bodyText(
  'Training centres currently submit spreadsheets containing candidate records to district offices via disparate manual channels. District officers manually inspect records, paper/unsecured certificates are created, and candidates receive credentials through unsecured email attachments. This legacy workflow suffers from high operational friction, lacks dual-governance oversight, and exposes the skilling ecosystem to fake or altered certificates.'
);
doc.moveDown(0.5);
bodyText(
  'CertiFlow is a centralized, digital government governance platform that automates the lifecycle of skilling certificates: atomic spreadsheet ingestion, mandatory two-officer district consensus, automated routing for high-volume batches (>=50 candidates) to Quality Assurance, cryptographic QR code certificate generation, simulated asynchronous notification dispatch, immutable audit logs, and zero-login public verification.'
);

// --- 2. DEPLOYMENT & VERIFICATION URLS ---
sectionTitle('2. Live Deployment URLs & Credentials');
bullet('Live Web Application (Frontend)', 'https://certiflow-skilling-platform.vercel.app');
bullet('Public Verification Portal', 'https://certiflow-skilling-platform.vercel.app/verify');
bullet('Cloud Backend API', 'https://certiflow-skilling-certificate-platform.onrender.com');
bullet('GitHub Repository', 'https://github.com/IMMADIMANI/Certiflow-Skilling-Certificate-Platform');
bullet('Cloud Database', 'Neon.tech (PostgreSQL 16 Serverless)');

doc.moveDown(0.4);
subsectionTitle('Reviewer & Judge Demo Credentials (All passwords: password123)');
bullet('Training Centre (Anika Singh)', 'anika@certiflow.in  (Creates batches, uploads CSV, resubmits)');
bullet('District Officer North (Dev Sharma)', 'dev@certiflow.in  (District review 1/2)');
bullet('District Officer South (Meera Patel)', 'meera@certiflow.in  (District review 2/2)');
bullet('District Officer East (Kabir Khan)', 'kabir@certiflow.in  (Alternate District Officer)');
bullet('Quality Team (Neha Gupta)', 'neha@certiflow.in  (Inspects batches >=50 candidates)');
bullet('State Office (Farah Irani)', 'farah@certiflow.in  (Final approval, cert issuance, revocation)');

// --- 3. MANDATORY TECHNOLOGY STACK ---
sectionTitle('3. Mandatory Technology Stack Architecture');
bullet('Frontend Framework', 'React.js 18 with Vite build tool and TypeScript');
bullet('UI Styling & Icons', 'Tailwind CSS, Lucide React (accessible, government-portal theme)');
bullet('Backend Runtime & API', 'Node.js (v24), Express.js, TypeScript with strict typings');
bullet('Database & ORM', 'PostgreSQL 16, Prisma ORM with automated migrations');
bullet('Security & Auth', 'JSON Web Tokens (JWT), HTTP Bearer Authorization, bcryptjs password hashing');
bullet('Document Engine', 'PDFKit for vector-grade PDF generation, QRCode for tamper-proof verification');
bullet('Realtime & Queues', 'Socket.IO event bus, BullMQ/Redis architecture for non-blocking asynchronous jobs');

doc.addPage();

// --- 4. THE SIX CRITICAL HACKATHON SCENARIOS ---
sectionTitle('4. The Six Critical Hackathon Scenarios — Execution & Proof');

subsectionTitle('Scenario 1: Invalid Spreadsheet Validation (Zero-Partial-Save)');
bodyText(
  'Implementation: In batch.controller.ts, validateCandidateRow() evaluates every record against schema rules (mandatory names, valid 10-digit phone regex, 12-digit Aadhar format, date validity, and intra-file duplication checks). If any error exists, the entire transaction is aborted with HTTP 422, returning exact row numbers and field descriptions. Zero corrupt records are written to PostgreSQL.'
);

subsectionTitle('Scenario 2: Simultaneous Dual District Officer Approval');
bodyText(
  'Implementation: In approval.controller.ts, approval is executed inside an atomic prisma.$transaction(). A unique compound constraint (batchId, officerId) guarantees an officer cannot vote twice. State transition logic verifies that count(approved) >= 2 before changing status from UNDER_REVIEW to STATE_REVIEW (or QUALITY_REVIEW), preventing concurrency race conditions.'
);

subsectionTitle('Scenario 3: 60-Candidate Batch & Quality Team Review');
bodyText(
  'Implementation: Batches containing >=50 candidates (configured via QUALITY_REVIEW_THRESHOLD) are intercepted after dual-district approval and automatically routed to QUALITY_REVIEW. Neha Gupta evaluates training scores and records a review decision. Upon final State approval, exactly 60 unique certificates and QR verification tokens are generated without duplicates.'
);

subsectionTitle('Scenario 4: Certificate Revocation & Public Verification');
bodyText(
  'Implementation: State officers can cancel issued credentials via state.controller.ts. The certificate record is flagged status=CANCELLED, recording cancelledAt and cancelReason. Public endpoint /api/verify/:id immediately flags the credential as invalid with red visual warnings, shielding employers from revoked credentials.'
);

subsectionTitle('Scenario 5: Delayed Officer Approval Detection (>48h)');
bodyText(
  'Implementation: The system computes SLA thresholds (submittedAt < now() - 48 hours). The dashboard and overdue queries highlight stalled batches with red alert badges to trigger administrative escalation.'
);

subsectionTitle('Scenario 6: Batch Return, Correction & Resubmission');
bodyText(
  'Implementation: District officers can return a batch with remarks. The batch status changes to RETURNED. The training centre fixes candidate data and resubmits. Prior district approval votes are reset, but the entire transaction history is permanently recorded in the immutable AuditLog table.'
);

// --- 5. DATA SCHEMA & ENTITY MODELS ---
sectionTitle('5. Relational Data Models (Prisma Schema)');
bodyText(
  '1. User: id, email, password, name, role (TRAINING_CENTRE, DISTRICT_OFFICER, QUALITY_TEAM, STATE_OFFICE), districtId\n' +
  '2. District: id, name, code (NORTH, SOUTH, EAST)\n' +
  '3. TrainingCentre: id, userId, name, code, districtId, address\n' +
  '4. Batch: id, trainingCentreId, title, courseType, courseDuration, status (DRAFT, SUBMITTED, UNDER_REVIEW, QUALITY_REVIEW, STATE_REVIEW, APPROVED, REJECTED, RETURNED), returnReason, timestamps\n' +
  '5. Candidate: id, batchId, name, fatherName, dob, phone, email, aadhar, courseCompleted, marks, grade, status\n' +
  '6. DistrictApproval: id, batchId, officerId, decision (APPROVED, REJECTED, RETURNED), remarks, createdAt (unique: [batchId, officerId])\n' +
  '7. Certificate: id, certificateNumber, candidateId, batchId, qrCode, pdfPath, status (ACTIVE, CANCELLED), cancelReason, issuedAt\n' +
  '8. AuditLog: id, userId, action, entityType, entityId, previousStatus, newStatus, remarks, createdAt'
);

// --- 6. CONCLUSION ---
sectionTitle('6. Submission Declaration & Compliance');
bodyText(
  'The CertiFlow platform satisfies 100% of the functional, technical, and governance requirements outlined in the hackathon brief. The solution is fully deployed, reproducible via Docker Compose, and publicly accessible for live judging.'
);

doc.end();

stream.on('finish', () => {
  console.log('PDF generated successfully at:', outputPath);
});
