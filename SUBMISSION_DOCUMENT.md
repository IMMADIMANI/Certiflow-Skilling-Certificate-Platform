# CertiFlow – Skilling Certificate Issuance & Verification Platform
## Official Hackathon Final Submission Document & Technical Dossier

---

### Executive Summary

CertiFlow is a decentralized, digital government governance platform designed to replace legacy spreadsheet submissions in skill development programs. It provides strict row-by-row schema validation, multi-officer consensus approval, automated quality review for high-volume batches, cryptographically verifiable PDF certificates with QR codes, simulated asynchronous notification dispatch, and tamper-proof public verification without requiring authentication.

---

### 1. Live Deployment & Repository Links

* **Live Web Application (Frontend):** https://certiflow-skilling-platform.vercel.app
* **Public Certificate Verifier:** https://certiflow-skilling-platform.vercel.app/verify
* **Cloud API Backend:** https://certiflow-skilling-certificate-platform.onrender.com
* **GitHub Repository:** https://github.com/IMMADIMANI/Certiflow-Skilling-Certificate-Platform
* **Cloud Database:** PostgreSQL 16 on Neon.tech (Multi-AZ Serverless)

---

### 2. Reviewer & Demo Accounts

All demo accounts use password: **`password123`**

| Role | Name | Email | Jurisdiction / Responsibility |
|---|---|---|---|
| **Training Centre** | Anika Singh | `anika@certiflow.in` | Batch creation, CSV uploads, error corrections |
| **District Officer** | Dev Sharma | `dev@certiflow.in` | North District Officer (Review 1/2) |
| **District Officer** | Meera Patel | `meera@certiflow.in` | South District Officer (Review 2/2) |
| **District Officer** | Kabir Khan | `kabir@certiflow.in` | East District Officer |
| **Quality Team** | Neha Gupta | `neha@certiflow.in` | Scrutiny for batches with ≥50 candidates |
| **State Office** | Farah Irani | `farah@certiflow.in` | Final approval, certificate issuance, revocation |
| **Public Verifier** | Anonymous | *No login needed* | Anyone verifying credential via QR code |

*(Note: Reviewers can also use the 1-Click Role Switcher dropdown located in the top header of the application).*

---

### 3. Mandatory Technology Stack

* **Frontend:** React.js 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router DOM, Axios
* **Backend:** Node.js v24, Express.js, TypeScript
* **Database & ORM:** PostgreSQL 16, Prisma ORM (v5.22.0) with automated migrations
* **Authentication & Authorization:** JWT (HS256), Role-Based Access Control (RBAC) middleware
* **Document Engine:** PDFKit (vector certificate generation), QRCode (tamper-proof verification links)
* **Realtime & Event Queue:** Socket.IO, BullMQ architecture with graceful degradation
* **Containerization:** Docker, Docker Compose (`postgres`, `redis`, `backend`, `frontend`)

---

### 4. Implementation Proof of the Six Hackathon Scenarios

#### Scenario 1: Invalid Spreadsheet Validation (Zero-Partial-Save)
* **Problem:** Training centres often upload corrupt files with missing names, invalid phone numbers, and duplicate entries.
* **Implementation:** `batch.controller.ts` runs `validateCandidateRow()`. Every row is checked against required field rules, regex formats, and duplicate checks within the batch.
* **Atomic Guarantee:** If even one row fails, the entire upload is aborted with HTTP 422. Exact row numbers and field errors are returned. Zero records are saved to PostgreSQL.

#### Scenario 2: Dual District Officer Approval (Consensus Governance)
* **Problem:** Single-officer approvals allow collusion and lack administrative cross-checking.
* **Implementation:** `approval.controller.ts` executes within an atomic `prisma.$transaction()`. A unique composite index `@@unique([batchId, officerId])` prevents double-voting.
* **State Transition:** The batch remains in `UNDER_REVIEW` until `approvedCount >= 2` before advancing to `STATE_REVIEW` (or `QUALITY_REVIEW`).

#### Scenario 3: 60-Candidate Batch & Quality Team Review
* **Problem:** Large batches represent significant government outlay and require additional audit checks.
* **Implementation:** Configurable threshold (`QUALITY_REVIEW_THRESHOLD=50`). Batches with ≥50 candidates are automatically intercepted and routed to `QUALITY_REVIEW`.
* **Outcome:** Neha Gupta records a formal quality review decision. Upon final State approval, exactly 60 unique certificates and QR verification tokens are generated without duplicates.

#### Scenario 4: Certificate Revocation & Public Verification
* **Problem:** Revoked or fraudulent credentials must immediately be recognizable to employers.
* **Implementation:** State officers can cancel issued certificates with an audit reason. The record is flagged `status = CANCELLED`.
* **Outcome:** The public verification endpoint `/api/verify/:id` immediately reflects the cancellation with prominent red visual alerts, preventing the acceptance of forged or cancelled certificates.

#### Scenario 5: Delayed Officer Approval Detection (>48h)
* **Problem:** Batches stuck with district officers delay student employment and create bureaucratic bottlenecks.
* **Implementation:** Queries check `submittedAt < now() - 48 hours`. Overdue batches are flagged on dashboards with warning badges to trigger administrative escalation.

#### Scenario 6: Batch Correction & Resubmission
* **Problem:** Errors must be rectifiable without corrupting historical audit records.
* **Implementation:** Officers can return a batch with remarks (`status = RETURNED`). The training centre re-uploads corrected data and resubmits. Prior votes are reset, but the complete audit trail is permanently preserved in the immutable `AuditLog` table.

---

### 5. Database Schema & Data Models

1. **User:** `id`, `email`, `password`, `name`, `role`, `districtId`, `createdAt`
2. **District:** `id`, `name`, `code`
3. **TrainingCentre:** `id`, `userId`, `name`, `code`, `districtId`, `address`
4. **Batch:** `id`, `trainingCentreId`, `title`, `courseType`, `courseDuration`, `status`, `submittedAt`, `approvedAt`, `returnReason`
5. **Candidate:** `id`, `batchId`, `name`, `fatherName`, `dob`, `phone`, `email`, `aadhar`, `courseCompleted`, `marks`, `grade`, `status`
6. **DistrictApproval:** `id`, `batchId`, `officerId`, `decision`, `remarks`, `createdAt` (Unique: `[batchId, officerId]`)
7. **QualityReview:** `id`, `batchId`, `reviewerId`, `decision`, `remarks`, `createdAt`
8. **StateApproval:** `id`, `batchId`, `officerId`, `decision`, `remarks`, `createdAt`
9. **Certificate:** `id`, `certificateNumber`, `candidateId`, `batchId`, `qrCode`, `pdfPath`, `status`, `cancelReason`, `issuedAt`
10. **AuditLog:** `id`, `userId`, `action`, `entityType`, `entityId`, `previousStatus`, `newStatus`, `remarks`, `createdAt`

---

### 6. Submission Declaration

This project has been developed in strict accordance with the problem statement guidelines, uses only the mandated technology stack, is fully deployed on production cloud infrastructure, and is ready for live evaluation.
