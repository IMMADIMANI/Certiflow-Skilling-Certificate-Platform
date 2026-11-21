#!/usr/bin/env pwsh
# CertiFlow Quick Setup Script
# Run this AFTER starting PostgreSQL and creating the certiflow database

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CertiFlow — Quick Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

# Step 1: Prisma DB Push
Write-Host "[1/3] Running database migration..." -ForegroundColor Yellow
Set-Location $backend
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Could not connect to PostgreSQL." -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Red
    Write-Host "  1. PostgreSQL service is running (search 'Services' in Windows)" -ForegroundColor Red
    Write-Host "  2. Database 'certiflow' exists (create it in pgAdmin)" -ForegroundColor Red
    Write-Host "  3. Password in backend\.env is correct" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Database migration successful!" -ForegroundColor Green

# Step 2: Seed
Write-Host ""
Write-Host "[2/3] Seeding demo data (users, districts)..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "Seed may have already run (OK to continue)" -ForegroundColor Yellow
}
Write-Host "Demo data ready!" -ForegroundColor Green

# Step 3: Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now open TWO terminal tabs in VS Code:" -ForegroundColor White
Write-Host ""
Write-Host "  Tab 1 (Backend):"  -ForegroundColor Yellow
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Tab 2 (Frontend):" -ForegroundColor Yellow
Write-Host "    cd frontend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Then open: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login: anika@certiflow.in / password123" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
