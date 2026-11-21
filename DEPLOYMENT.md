# CertiFlow – Deployment & Scaling Guide

> This document covers production deployment, infrastructure architecture, scaling strategy, failure handling, and cost estimates for CertiFlow at national scale.

---

## 1. Target Scale

| Metric | Target |
|--------|--------|
| Registered Users | 100,000 |
| Daily Active Users | 10,000 |
| Batches processed / hour | 500 |
| PDFs generated / day | 30,000 |
| WhatsApp notifications / day | 30,000 |
| Concurrent WebSocket connections | 2,000 |
| Certificate verifications / day | 50,000 |

---

## 2. Architecture Overview

```
                         ┌─────────────────────┐
                         │   CloudFront (CDN)   │
                         │   Static React App   │
                         └──────────┬──────────┘
                                    │ HTTPS
                         ┌──────────▼──────────┐
                         │  Application Load   │
                         │    Balancer (ALB)   │
                         └──────────┬──────────┘
                    ┌───────────────┼───────────────┐
           ┌────────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
           │  API Server 1 │ │API Server 2│ │API Server 3 │
           │  (Node/ECS)   │ │(Node/ECS)  │ │(Node/ECS)   │
           └────────┬──────┘ └─────┬──────┘ └──────┬──────┘
                    └──────────────┼────────────────┘
                    ┌──────────────┼────────────────┐
           ┌────────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
           │  PostgreSQL   │ │   Redis    │ │  S3 Bucket  │
           │  (RDS Multi-  │ │(ElastiCache│ │(Certificates│
           │  AZ)          │ │ Cluster)   │ │  & Uploads) │
           └───────────────┘ └─────┬──────┘ └─────────────┘
                                   │ BullMQ queues
                    ┌──────────────┼────────────────┐
           ┌────────▼──────┐ ┌─────▼──────┐
           │  PDF Worker 1 │ │Notify Wkr 1│
           │  (ECS Fargate)│ │(ECS Fargate│
           └───────────────┘ └────────────┘
```

---

## 3. Cloud Infrastructure (AWS)

### Compute

| Service | Usage |
|---------|-------|
| **ECS Fargate** | API servers (auto-scaling, 2–10 tasks) |
| **ECS Fargate** | PDF Worker tasks (scales with queue depth) |
| **ECS Fargate** | Notification Worker tasks |
| **CloudFront + S3** | Frontend static hosting |

### Database

| Service | Config |
|---------|--------|
| **Amazon RDS PostgreSQL 16** | Multi-AZ, db.t3.medium (dev), db.r6g.large (prod) |
| Read replica | For dashboard queries and verification |
| Automated backups | 7-day retention, daily snapshots |
| Connection pooling | PgBouncer sidecar or RDS Proxy |

### Cache & Queues

| Service | Config |
|---------|--------|
| **Amazon ElastiCache (Redis 7)** | cache.r6g.large, 2 nodes cluster mode |
| BullMQ queues | PDF_GENERATION, WHATSAPP_NOTIFICATIONS |
| Rate limiting | Redis sliding window (100 req/min per user) |

### Storage

| Service | Usage |
|---------|-------|
| **Amazon S3** | Generated PDF certificates (server-side encrypted) |
| S3 presigned URLs | Time-limited certificate download links (15 min) |
| S3 Lifecycle | Archive to Glacier after 2 years |

### Networking

| Service | Usage |
|---------|-------|
| **ALB** | HTTPS termination, health checks, sticky sessions for WebSocket |
| **Route 53** | DNS, health-based failover |
| **ACM** | TLS certificates (auto-renew) |
| **VPC** | Private subnets for DB and workers; public for ALB |

---

## 4. Auto-Scaling Configuration

### API Servers (ECS Service Auto Scaling)
```yaml
MinCapacity: 2
MaxCapacity: 10
ScaleOutPolicy:
  MetricType: ECSServiceAverageCPUUtilization
  TargetValue: 65
  ScaleOutCooldown: 60s
ScaleInCooldown: 300s
```

### Worker Scaling (Queue-depth based)
```yaml
# Scale PDF workers based on BullMQ queue depth
# CloudWatch custom metric: certiflow/queue/pdf_generation/waiting
MinWorkers: 1
MaxWorkers: 20
ScaleAt: queue_depth > 50
ScaleDownAt: queue_depth < 5
```

---

## 5. Background Job Configuration

### PDF Generation Queue
```
Queue: pdf_generation
Concurrency per worker: 5
Retry: 3 attempts, exponential backoff (5s, 25s, 125s)
Job timeout: 30s
Idempotency: skip if certificate already exists in DB
```

### WhatsApp Notification Queue
```
Queue: whatsapp_notifications
Concurrency per worker: 10
Retry: 3 attempts (5s, 15s, 45s delay)
Job timeout: 15s
Deduplication: Redis SETNX lock on candidateId+certId
Fallback: mark as FAILED after 3 retries, retry daily
```

---

## 6. Failure Handling

### Database Failure
- RDS Multi-AZ: automatic failover in ~60s
- Read replica promotes to primary
- API servers retry connection with exponential backoff

### Redis Failure
- App degrades gracefully (non-fatal warnings in logs)
- BullMQ falls back to in-process queue (limited)
- Rate limiting disabled temporarily
- Alert: CloudWatch alarm → SNS → PagerDuty

### WhatsApp Provider Outage
- Jobs remain in BullMQ with DELAYED status
- Worker retries with backoff up to 24 hours
- After 24h, mark as PENDING_MANUAL and alert admin
- Certificates are still valid — notification is delivery-only

### Worker Crash
- ECS automatically restarts failed containers
- BullMQ jobs return to queue (at-least-once delivery)
- Idempotency checks prevent duplicate certificates

### Certificate Storage Failure (S3)
- S3 SLA: 99.999999999% durability
- Cross-region replication for disaster recovery
- Signed URL regeneration on access — no permanent URLs exposed

---

## 7. Security

| Concern | Solution |
|---------|----------|
| Auth | JWT (HS256), 24h expiry, refresh tokens |
| API protection | Helmet.js, CORS whitelist, rate limiting |
| SQL injection | Prisma parameterized queries only |
| XSS | React auto-escaping + CSP headers |
| Data at rest | RDS encryption (AES-256), S3 SSE-S3 |
| Data in transit | TLS 1.3 everywhere |
| Certificate IDs | UUID v4 — not guessable |
| Audit logs | Write-once (no UPDATE/DELETE on audit_logs table) |
| File uploads | Whitelist MIME types, virus scan via ClamAV sidecar |
| Aadhar/PII | Never logged; masked in audit entries |

---

## 8. Monitoring & Observability

### Metrics (CloudWatch + Datadog)
- API latency (p50, p95, p99)
- Queue depth per queue
- PDF generation time
- WhatsApp delivery rate
- Certificate verification requests/min
- Error rate by endpoint

### Alerts
- API error rate > 1% → PagerDuty
- Queue depth > 500 → scale workers + alert
- DB connections > 80% → alert
- Overdue batch (>48h) → email district supervisor
- Failed notifications > 10% → alert admin

### Logging
- Structured JSON logs (Winston)
- Centralized in CloudWatch Logs Insights
- Log retention: 90 days hot, S3 archive 1 year

### Health Checks
- `/health` endpoint polled every 30s by ALB
- Checks: DB connectivity, Redis ping, worker heartbeat

---

## 9. Database Migration Strategy

```bash
# Never run db push in production — use migrate deploy
npx prisma migrate deploy

# Rollback: keep migration files in Git
# Schema changes: always additive first (never drop columns immediately)
```

---

## 10. CI/CD Pipeline

```
GitHub Push → GitHub Actions
  ├── Lint + Type Check (tsc --noEmit)
  ├── Unit Tests (jest)
  ├── Integration Tests (jest + test DB)
  ├── Docker Build (backend + frontend)
  ├── Push to ECR
  └── ECS Deploy (rolling update, 0 downtime)
```

---

## 11. Environment Variables (Production)

```bash
# Backend (ECS Task Definition / AWS Secrets Manager)
DATABASE_URL=postgresql://...            # From RDS
REDIS_URL=redis://...                    # From ElastiCache
JWT_SECRET=<64-char random>              # From Secrets Manager
NODE_ENV=production
QUALITY_REVIEW_THRESHOLD=50
CERTIFICATE_STORAGE_PATH=s3://certiflow-certs/
WHATSAPP_PROVIDER=mock                   # or twilio/waba

# Frontend (CloudFront env / build arg)
VITE_API_URL=https://api.certiflow.in
```

---

## 12. Estimated Monthly Cost (AWS, ap-south-1)

| Service | Spec | Est. Cost/month |
|---------|------|----------------|
| ECS Fargate (API, 2–4 tasks) | 0.5 vCPU, 1 GB each | ~\$30–60 |
| ECS Fargate (Workers, 2 tasks) | 1 vCPU, 2 GB each | ~\$30 |
| RDS PostgreSQL (Multi-AZ) | db.t3.medium | ~\$80 |
| ElastiCache Redis | cache.t3.micro (dev) / r6g.large (prod) | \$20–130 |
| S3 (30K PDFs × ~200KB = ~6GB) | Standard + requests | ~\$5 |
| CloudFront | 10GB transfer | ~\$5 |
| ALB | 1 LCU | ~\$20 |
| Route 53 | 1 zone + queries | ~\$5 |
| CloudWatch / Logs | Standard | ~\$15 |
| **Total (dev/staging)** | | **~\$100–150/mo** |
| **Total (production)** | | **~\$300–500/mo** |

> For hackathon demo: run everything locally with Docker Compose. Cost = \$0.

---

## 13. Local Docker Compose (Development)

```bash
# Start all services
docker-compose up -d

# Services started:
#   postgres:5432   → CertiFlow database
#   redis:6379      → Cache + queues
#   backend:3001    → API server
#   frontend:5173   → React dev server

# Stop everything
docker-compose down

# Wipe database (careful!)
docker-compose down -v
```

See [`docker-compose.yml`](./docker-compose.yml) for full configuration.

---

## 14. Zero-Downtime Deployment Checklist

- [ ] Run `prisma migrate deploy` before deploying new API version
- [ ] Deploy workers before API (workers handle old + new job formats)
- [ ] ECS rolling update: min 50% healthy, max 200% capacity
- [ ] Smoke test `/health` after deploy
- [ ] Monitor error rate for 5 minutes post-deploy
- [ ] Keep previous Docker image tagged for instant rollback

---

*Last updated: CertiFlow Hackathon Submission 2024*
