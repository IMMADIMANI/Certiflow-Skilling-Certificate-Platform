# 🚀 CertiFlow — START HERE

> Open this folder in VS Code, then follow the steps below **in order**.

---

## ⚡ STEP 1 — Start PostgreSQL (Windows Service)

Open **Windows Search** → type `Services` → open it.

Find **postgresql-x64-18** → Right-click → **Start**

OR open **PowerShell as Administrator** and run:
```powershell
net start postgresql-x64-18
```

---

## ⚡ STEP 2 — Create the Database

Open **pgAdmin 4** (installed with PostgreSQL) or **SQL Shell (psql)**.

If using SQL Shell (psql):
- Server: localhost
- Database: postgres
- Port: 5432
- Username: postgres
- Password: (whatever you set during install)

Then run this SQL command:
```sql
CREATE DATABASE certiflow;
```

If using pgAdmin:
- Right-click **Databases** → **Create** → **Database**
- Name: `certiflow` → **Save**

---

## ⚡ STEP 3 — Update Password in .env (if needed)

If your PostgreSQL password is NOT `postgres`, open:
```
backend\.env
```
And change line 1:
```
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/certiflow"
```

---

## ⚡ STEP 4 — Run Database Migration

Open **Terminal in VS Code** (Ctrl+`) and run:

```powershell
cd backend
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npx prisma db push
```

Expected output:
```
✅ Your database is now in sync with your Prisma schema.
```

---

## ⚡ STEP 5 — Seed Demo Data (Creates All 6 Users)

```powershell
npm run db:seed
```

Expected output:
```
✅ Seeded districts, training centre, and 6 demo users
```

---

## ⚡ STEP 6 — Start the Backend

```powershell
npm run dev
```

Expected: `🚀 CertiFlow API running on http://localhost:3001`

**Leave this terminal running.**

---

## ⚡ STEP 7 — Start the Frontend (New Terminal Tab)

Press **Ctrl+Shift+5** in VS Code to open a new terminal, then:

```powershell
cd frontend
npm run dev
```

Expected: `Local: http://localhost:5173`

---

## ⚡ STEP 8 — Open in Browser

Go to: **http://localhost:5173**

### Demo Login Accounts:
| Name | Email | Password | Role |
|------|-------|----------|------|
| Anika | anika@certiflow.in | password123 | Training Centre |
| Dev | dev@certiflow.in | password123 | District Officer |
| Meera | meera@certiflow.in | password123 | District Officer |
| Kabir | kabir@certiflow.in | password123 | District Officer |
| Neha | neha@certiflow.in | password123 | Quality Team |
| Farah | farah@certiflow.in | password123 | State Office |

---

## ⚡ STEP 9 — Push to GitHub

Run this in VS Code terminal (from the project root):

```powershell
cd C:\Users\Admin\.gemini\antigravity\scratch\certiflow
git remote add origin https://github.com/IMMADIMANI/certiflow-skilling-platform.git
git push -u origin main
```

> **Note:** GitHub will ask for username + password.
> Use your GitHub username and a **Personal Access Token** as the password.
> Create one at: https://github.com/settings/tokens → Generate new token (classic) → check **repo** scope → Copy the token.

---

## 🧪 Testing the 6 Hackathon Scenarios

### Scenario 1 — Invalid Excel Upload
- Login as **Anika** (Training Centre)
- Create a batch → Upload file → Choose `backend/samples/sample_invalid_rows.csv`
- Expected: Shows errors with row numbers, nothing saved ✅

### Scenario 2 — Simultaneous District Approval
- Login as **Dev** → Approve a submitted batch
- Login as **Meera** → Approve the same batch
- Expected: Batch moves to STATE_REVIEW after 2nd approval ✅

### Scenario 3 — 60 Candidates
- Login as **Anika** → Create batch → Upload `backend/samples/sample_60_candidates.csv`
- Submit → Both Dev + Meera approve → Farah gives final approval
- Expected: Exactly 60 unique certificates generated ✅

### Scenario 4 — Certificate Cancellation
- Login as **Farah** (State Office) → Certificates tab → Cancel one
- Open `/verify` → Enter that certificate ID
- Expected: Shows "CANCELLED" in red ✅

### Scenario 5 — Overdue Batch
- Dashboard shows batches pending > 48 hours as overdue
- State office dashboard shows overdue count ✅

### Scenario 6 — Batch Resubmission
- Officer returns a batch with reason
- Anika corrects and resubmits
- Previous approval history preserved in Audit Log ✅

---

## 📁 Project Structure

```
certiflow/
├── backend/          ← Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── modules/  ← auth, batches, approvals, certificates...
│   │   ├── config/   ← database, redis
│   │   └── utils/    ← validators, seed
│   ├── prisma/       ← Database schema
│   ├── samples/      ← Test CSV files
│   └── .env          ← ⚠️ Update DB password here if needed
├── frontend/         ← React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── pages/    ← All UI pages
│       └── components/
├── docker-compose.yml
├── README.md
├── SETUP.md
└── DEPLOYMENT.md
```

---

## ❓ Common Issues

| Problem | Fix |
|---------|-----|
| `P1001: Can't reach database` | Start PostgreSQL service (Step 1) |
| `P1003: Database does not exist` | Create `certiflow` database (Step 2) |
| Wrong password error | Update `DATABASE_URL` in `backend\.env` (Step 3) |
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Run `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"` first |
| Port 3001 already in use | Kill the existing process: `npx kill-port 3001` |
| Port 5173 already in use | Kill: `npx kill-port 5173` |
| GitHub push asks for password | Use Personal Access Token, not your GitHub password |
