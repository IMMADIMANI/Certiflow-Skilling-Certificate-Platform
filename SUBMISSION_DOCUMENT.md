# CertiFlow – Skilling Certificate Issuance & Verification Platform
## Official Hackathon Final Submission Dossier & Technical Report

---

### Executive Summary

**CertiFlow** is a centralized, digital government governance platform designed to replace vulnerable paper credentials and manual spreadsheet submissions in national skill development programs. It provides strict row-by-row schema validation, multi-officer consensus approval, automated quality review for high-volume batches, cryptographically verifiable PDF certificates with QR codes, simulated asynchronous notification dispatch, and tamper-proof public verification without requiring authentication.

---

### 1. Live Deployment & Repository Links

* **Live Web Application (Frontend):** [https://certiflow-skilling-platform.vercel.app](https://certiflow-skilling-platform.vercel.app)
* **Public Certificate Verifier:** [https://certiflow-skilling-platform.vercel.app/verify](https://certiflow-skilling-platform.vercel.app/verify)
* **Cloud API Backend:** [https://certiflow-skilling-certificate-platform.onrender.com](https://certiflow-skilling-certificate-platform.onrender.com)
* **GitHub Repository:** [https://github.com/IMMADIMANI/Certiflow-Skilling-Certificate-Platform](https://github.com/IMMADIMANI/Certiflow-Skilling-Certificate-Platform)
* **Cloud Database:** PostgreSQL 16 on Neon.tech (Multi-AZ Serverless)

---

### 2. Reviewer & Judge Demo Credentials

All accounts use password: **`password123`**

| Role | Officer Name | Login Email | Primary Governance Responsibility |
|---|---|---|---|
| **Training Centre** | Anika Singh | `anika@certiflow.in` | Batch creation, CSV uploads, error corrections |
| **District Officer 1** | Dev Sharma | `dev@certiflow.in` | District review 1/2 (North District) |
| **District Officer 2** | Meera Patel | `meera@certiflow.in` | District review 2/2 (South District) |
| **District Officer 3** | Kabir Khan | `kabir@certiflow.in` | Alternate District Officer (East District) |
| **Quality Team** | Neha Gupta | `neha@certiflow.in` | Scrutiny for batches with ≥50 candidates |
| **State Office** | Farah Irani | `farah@certiflow.in` | Final approval, certificate issuance, revocation |
| **Public Verifier** | Anonymous | *No login needed* | Anyone verifying credential via QR code |

*(Note: Reviewers can also use the 1-Click Role Switcher dropdown located in the top header of the application).*

---

### 3. Live Application Interface Proof

![Figure 1: Production CertiFlow Dashboard](./docs/images/dashboard_live.png)
*Figure 1: Production CertiFlow Dashboard featuring live WebSocket queue status, 1-Click Role Switcher, real-time KPI metric cards, and recent batch queues.*

---

### 4. Implementation Proof of the Six Critical Hackathon Scenarios

#### Scenario 1: Invalid Spreadsheet Validation (Zero-Partial-Save)
* **Problem:** Training centres often upload corrupt files with missing names, invalid phone numbers, and duplicate entries.
* **Implementation:** `backend/src/modules/batches/batch.controller.ts` runs `validateCandidateRow()`. Every row is checked against required field rules, regex formats, and duplicate checks within the batch.
* **Observed Proof:** When `sample_invalid_rows.csv` is uploaded, 6 validation errors are flagged with exact row numbers (e.g. Row 2: Candidate name required, Row 2: Father name required, Row 4: Invalid phone). Zero records are saved to PostgreSQL. Strict transaction rollback guarantees data atomicity.

#### Scenario 2: Dual District Officer Approval (Consensus Governance)
* **Problem:** Single-officer approvals allow collusion and lack administrative cross-checking.
* **Implementation:** `backend/src/modules/approvals/approval.controller.ts` executes within an atomic `prisma.$transaction()`. A unique composite index `@@unique([batchId, officerId])` prevents double-voting.
* **Observed Proof:** When Dev Sharma approves, approval count increments to 1/2 and status remains `UNDER_REVIEW`. Only when Meera Patel records the 2nd distinct approval does the workflow transition to `STATE_REVIEW` (or `QUALITY_REVIEW`). Attempting duplicate approval by the same officer raises HTTP 409 conflict.

#### Scenario 3: 60-Candidate Batch & Quality Team Review
* **Problem:** Large batches represent significant government outlay and require additional audit checks.
* **Implementation:** Configurable threshold (`QUALITY_REVIEW_THRESHOLD=50`). Batches with ≥50 candidates are automatically intercepted and routed to `QUALITY_REVIEW`.
* **Observed Proof:** Neha Gupta inspects student marks and records quality approval. Following State Office final authorization, the PDF generator produces exactly 60 unique certificates and QR verification tokens without duplicates.

#### Scenario 4: Certificate Revocation & Public Verification
* **Problem:** Revoked or fraudulent credentials must immediately be recognizable to employers.
* **Implementation:** State officers can cancel issued credentials via `state.controller.ts`. The certificate record is flagged `status = CANCELLED`, recording `cancelledAt` and `cancelReason`.
* **Observed Proof:** The public verification endpoint `/api/verify/:id` immediately reflects the cancellation with prominent red visual alerts, preventing the acceptance of revoked credentials.

#### Scenario 5: Delayed Officer Approval Detection (>48h)
* **Problem:** Batches stuck with district officers delay student employment and create bureaucratic bottlenecks.
* **Implementation:** Queries check `submittedAt < now() - 48 hours`. Overdue batches are flagged on dashboards with warning badges to trigger administrative escalation.

#### Scenario 6: Batch Correction & Resubmission
* **Problem:** Errors must be rectifiable without corrupting historical audit records.
* **Implementation:** Officers can return a batch with remarks (`status = RETURNED`). The training centre re-uploads corrected data and resubmits. Prior votes are reset, but the complete audit trail is permanently preserved in the immutable `AuditLog` table.

---

### 5. Cloud Deployment & Live Infrastructure Proof

![Figure 2: Live Backend Deployment on Render](./docs/images/render_deployment_live.png)
*Figure 2: Live Backend Deployment on Render showing automated Prisma database synchronization, demo account seeding, and server initialization on HTTPS.*

![Figure 3: Production Vercel Deployment](./docs/images/vercel_env_setup.png)
*Figure 3: Production Vercel Deployment Linking Frontend to Render Cloud API via VITE_API_URL.*

![Figure 4: PostgreSQL Database Architecture in pgAdmin](./docs/images/postgres_database.png)
*Figure 4: PostgreSQL Database Architecture in pgAdmin showing relational tables, constraints, and audit logs.*

---

### 6. Relational Data Models (Prisma Schema)

```prisma
model User {
  id         String     @id @default(uuid())
  email      String     @unique
  password   String
  name       String
  role       Role       // TRAINING_CENTRE, DISTRICT_OFFICER, QUALITY_TEAM, STATE_OFFICE
  districtId String?
  district   District?  @relation(fields: [districtId], references: [id])
}

model Batch {
  id                String             @id @default(uuid())
  trainingCentreId  String
  title             String
  courseType        String
  courseDuration    String
  status            BatchStatus        // DRAFT, SUBMITTED, UNDER_REVIEW, QUALITY_REVIEW, STATE_REVIEW, APPROVED, REJECTED, RETURNED
  submittedAt       DateTime?
  approvedAt        DateTime?
  returnReason      String?
  districtApprovals DistrictApproval[]
}

model DistrictApproval {
  id        String   @id @default(uuid())
  batchId   String
  officerId String
  decision  ApprovalDecision
  remarks   String?
  createdAt DateTime @default(now())

  @@unique([batchId, officerId]) // Enforces dual consensus without duplication
}

model Certificate {
  id                String            @id @default(uuid())
  certificateNumber String            @unique
  candidateId       String            @unique
  batchId           String
  qrCode            String
  pdfPath           String?
  status            CertificateStatus // ACTIVE, CANCELLED
  cancelledAt       DateTime?
  cancelReason      String?
  issuedAt          DateTime          @default(now())
}
```

---

### 7. Cryptographic QR Verification Token

![Figure 5: QR Verification Token](./docs/images/qr_verification_token.png)
*Figure 5: Cryptographic QR verification token embedded into generated certificates directing smartphones to official public verification.*

---

### 8. Final Submission Declaration

This project has been developed in strict accordance with the hackathon problem statement guidelines, uses only the mandated technology stack, is fully deployed on production cloud infrastructure, and is ready for live evaluation.
