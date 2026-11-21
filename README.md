# CertiFlow – Skilling Certificate Issuance Platform

> **Hackathon Submission** | Full-Stack Certificate Management System

## 🎯 Problem Statement

Training centres currently submit spreadsheets to district offices where officers manually approve batches, certificates are generated manually, and students receive them through email. This process is **slow, difficult to track, and vulnerable to fake certificates.**

## ✅ Solution

CertiFlow is a centralized digital platform that manages the entire certificate approval, issuance, and verification process — from Excel upload to PDF certificate delivery.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│         React + Vite + TypeScript + Tailwind     │
│              Port 5173                           │
└─────────────────┬───────────────────────────────┘
                  │ HTTP / WebSocket (Socket.IO)
┌─────────────────▼───────────────────────────────┐
│                  BACKEND API                     │
│          Node.js + Express + TypeScript          │
│              Port 3001                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Auth/JWT  │ │  Batches │ │   Certificates   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Approvals │ │ Quality  │ │   State Office   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Audit   │ │ Verify   │ │  Notifications   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└──────┬──────────────────────────┬────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼──────┐
│  PostgreSQL  │          │     Redis      │
│   Port 5432  │          │   Port 6379    │
│  Prisma ORM  │          │  Cache/Queue   │
└─────────────┘          └───────────────┘
```

## 🔧 Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite + TypeScript | Fast development, type safety |
| Styling | Tailwind CSS | Rapid, consistent UI |
| Backend | Node.js + Express + TypeScript | Required by hackathon |
| ORM | Prisma | Type-safe DB access, migrations |
| Database | PostgreSQL | ACID transactions for concurrent approvals |
| Cache | Redis | Queue management, performance |
| Queues | BullMQ (Redis) | Background jobs (PDF generation, notifications) |
| Auth | JWT | Stateless, scalable authentication |
| Real-time | Socket.IO | Live status updates |
| PDF | PDFKit | Server-side PDF generation |
| QR | qrcode | Certificate verification QR codes |
| Excel | xlsx | Parse candidate upload files |

## 👥 Demo Accounts

| Name | Email | Password | Role |
|------|-------|----------|------|
| Anika Singh | anika@certiflow.in | password123 | Training Centre |
| Dev Sharma | dev@certiflow.in | password123 | District Officer |
| Meera Patel | meera@certiflow.in | password123 | District Officer |
| Kabir Khan | kabir@certiflow.in | password123 | District Officer |
| Neha Gupta | neha@certiflow.in | password123 | Quality Team |
| Farah Irani | farah@certiflow.in | password123 | State Office |

## 🔄 Approval Workflow

```
Training Centre → Upload CSV → Submit Batch
        ↓
District Officer 1 Reviews
        ↓
District Officer 2 Reviews (needs 2 approvals)
        ↓
   [If batch ≥ 50 candidates] → Quality Review → State Office
   [If batch < 50 candidates] → State Office directly
        ↓
State Office Final Approval
        ↓
PDF Certificates Generated (1 per candidate)
        ↓
WhatsApp Notifications (simulated, with retry)
```

## 🛡️ Key Technical Decisions

### 1. Concurrent Approval Safety
PostgreSQL transactions with `SELECT FOR UPDATE` prevent two officers from simultaneously creating duplicate approval records. The unique constraint on `(batchId, officerId)` ensures idempotency.

### 2. Invalid Upload Rollback
Excel validation is performed on ALL rows before any database write. If any row fails validation, an error is returned with exact row numbers and NO data is saved.

### 3. Certificate Idempotency
Before generating any certificate, the system checks if one already exists for that candidate. This prevents duplicate certificates even if the generation job runs twice.

### 4. Quality Review Threshold
Batches with **≥ 50 candidates** require quality review. This is configurable via `QUALITY_REVIEW_THRESHOLD` environment variable.

### 5. WhatsApp Simulation
An 80% success rate simulator handles delivery with up to 3 retries and exponential backoff. A `UNIQUE` constraint on `(candidateId, channel)` prevents duplicate notifications.

### 6. Batch Resubmission
When a batch is returned, **previous approval records are retained** in the audit log, but district approvals are reset so the corrected batch gets fresh reviews. This provides full traceability.

## 📁 Project Structure

```
certiflow/
├── frontend/          # React + Vite + TypeScript frontend
│   └── src/
│       ├── pages/     # Role-specific dashboards
│       ├── components/# Reusable UI components
│       ├── services/  # API calls
│       ├── context/   # Auth context
│       └── types/     # TypeScript types
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   ├── modules/   # Feature modules (auth, batches, etc.)
│   │   ├── middleware/ # Auth, error handling
│   │   ├── utils/     # Validators, seed data
│   │   └── config/    # DB and Redis config
│   ├── prisma/        # Schema and migrations
│   ├── uploads/       # Uploaded Excel files (temp)
│   └── certificates/  # Generated PDFs
├── docker-compose.yml # Full stack Docker setup
├── README.md
├── SETUP.md
└── DEPLOYMENT.md
```

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for complete setup instructions.

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/certiflow-skilling-platform
cd certiflow-skilling-platform

# 2. Start PostgreSQL and Redis (Docker required)
docker-compose up -d postgres redis

# 3. Setup backend
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev

# 4. Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and use any demo account to log in.

## 📋 Hackathon Scenarios

| Scenario | Implementation |
|----------|----------------|
| Invalid Excel Upload | Row-by-row validation, exact error reporting, atomic rollback |
| Simultaneous Approval | PostgreSQL transactions + unique constraints |
| 60-Candidate Batch | Idempotent certificate generation |
| Certificate Cancellation | Immediate status update, verified in public portal |
| Delayed Officer Approval | 48-hour overdue detection, dashboard alerts |
| Batch Resubmission | History retained, approvals reset with documentation |

## 📄 License

MIT License — Free to use for hackathon demonstration purposes.
