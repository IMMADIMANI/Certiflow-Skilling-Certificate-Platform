# CertiFlow – Setup Guide

> Complete instructions to run CertiFlow from scratch on Windows.

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|------|---------|---------|
| Node.js | v18+ | https://nodejs.org |
| Git | Latest | https://git-scm.com |
| PostgreSQL | v14+ | https://www.postgresql.org/download/ OR use Docker |
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop/ |

### Verify installations (run in PowerShell):
```powershell
node --version    # Should show v18 or higher
npm --version     # Should show v8 or higher
git --version     # Should show git version
docker --version  # Should show Docker version
```

---

## Option A: Run with Docker (Recommended)

This is the easiest way — Docker handles PostgreSQL and Redis automatically.

### Step 1: Clone the repository
```powershell
git clone https://github.com/YOUR_USERNAME/certiflow-skilling-platform
cd certiflow-skilling-platform
```

### Step 2: Start infrastructure services
```powershell
docker-compose up -d postgres redis
```
Wait 10 seconds for the services to initialize.

### Step 3: Setup backend
```powershell
cd backend
npm install
copy .env.example .env
npx prisma db push
npm run db:seed
```

### Step 4: Start backend server
```powershell
npm run dev
```
You should see: `CertiFlow API running on http://localhost:3001`

### Step 5: Setup and start frontend (open a new PowerShell window)
```powershell
cd certiflow-skilling-platform\frontend
npm install
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 6: Open the application
Navigate to http://localhost:5173 in your browser.

---

## Option B: Run with Local PostgreSQL

If you have PostgreSQL installed locally:

### Step 1: Create the database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE certiflow;
```

### Step 2: Update the backend .env file
Open `backend/.env` and set:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/certiflow"
```

### Step 3: (Optional) Start Redis
```powershell
# If you have Redis for Windows:
redis-server

# Or use Docker just for Redis:
docker run -d -p 6379:6379 redis:7-alpine
```

> **Note:** The app works without Redis. Redis adds queue management and caching but is not required for core functionality.

### Step 4: Continue from Step 3 above (npm install, prisma push, seed, dev)

---

## Demo Accounts

After seeding, these accounts are available:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Anika Singh | anika@certiflow.in | password123 | Training Centre |
| Dev Sharma | dev@certiflow.in | password123 | District Officer |
| Meera Patel | meera@certiflow.in | password123 | District Officer |
| Kabir Khan | kabir@certiflow.in | password123 | District Officer |
| Neha Gupta | neha@certiflow.in | password123 | Quality Team |
| Farah Irani | farah@certiflow.in | password123 | State Office |

> On the login page, click any demo account card to log in instantly — no typing required!

---

## Demo Data Walkthrough

### Scenario 1: Upload Invalid Excel File
1. Log in as **Anika** (Training Centre)
2. Create a new batch
3. Download the CSV template
4. Add a row with an invalid phone number (e.g., "12345")
5. Upload the file → You will see exact row-level errors, nothing is saved

### Scenario 2: Normal Approval Flow
1. Log in as **Anika**, create a batch, upload valid candidates, submit
2. Log in as **Dev** (District Officer), approve the batch
3. Log in as **Meera** (District Officer), approve the same batch
4. After 2 approvals, batch moves to State Review
5. Log in as **Farah** (State Office), give final approval
6. Certificates are automatically generated

### Scenario 3: Large Batch (60+ candidates)
1. Upload a batch with 50+ candidates
2. After 2 district approvals → goes to Quality Review first
3. Log in as **Neha** (Quality Team) and approve
4. Then Farah can give state approval

### Scenario 4: Certificate Verification
1. After certificates are generated, go to http://localhost:5173/verify
2. Enter a certificate number (shown in the Certificates page)
3. Verify it shows as valid

### Scenario 5: Certificate Cancellation
1. Log in as **Farah** (State Office)
2. Go to Certificates page
3. Cancel a certificate
4. Verify the same certificate now shows as "Cancelled" on the verify page

---

## Running Tests
```powershell
cd backend
npm test
```

Expected output: All tests pass (validation logic, auth endpoints).

---

## Sample Excel Template

Download from the app (Batch Detail page → Download Template), or create a CSV with these columns:

```csv
name,fatherName,dob,phone,email,aadhar,courseCompleted,completionDate,marks,grade
Rahul Kumar,Suresh Kumar,1998-05-15,9876543210,rahul@email.com,123456789012,Web Development,2024-06-30,85,A
Priya Sharma,Mohan Sharma,1999-02-20,9876543211,priya@email.com,123456789013,Web Development,2024-06-30,78,B
```

### Required columns:
- `name` — Full name (required)
- `fatherName` — Father's name (required)
- `dob` — Date of birth, format: YYYY-MM-DD (required)
- `phone` — 10-digit mobile number (required)
- `courseCompleted` — Course name (required)
- `completionDate` — Completion date, format: YYYY-MM-DD (required)

### Optional columns:
- `email` — Email address
- `aadhar` — Aadhar number (12 digits)
- `marks` — Percentage marks
- `grade` — Grade (A/B/C/D)

---

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running: `docker-compose ps`
- Check the DATABASE_URL in `backend/.env`

### "Redis connection refused"
- The app works without Redis. The warning is non-fatal.
- To use Redis: `docker-compose up -d redis`

### "Port already in use"
```powershell
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### TypeScript errors during build
```powershell
cd backend
npx tsc --noEmit
```
Review and fix reported errors.
