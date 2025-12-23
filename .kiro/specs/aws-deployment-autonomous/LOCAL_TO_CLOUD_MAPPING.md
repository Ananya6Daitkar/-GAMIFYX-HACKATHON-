# Local → Cloud Component Mapping

## Component Migration Matrix

### Frontend (React)

| Aspect | Local | Cloud | Migration |
|--------|-------|-------|-----------|
| Build | `npm run build` | Same | Build locally, upload to S3 |
| Serving | Dev server :3000 | S3 + CloudFront | Upload dist/ to S3 bucket |
| API URL | `http://localhost:5000` | ALB DNS | Update env var to ALB endpoint |
| CORS | localhost | ALB domain | Backend CORS updated |

**Migration Steps:**
1. Build: `npm run build --workspace=frontend`
2. Create S3 bucket: `aws s3 mb s3://gamifyx-demo-[TIMESTAMP]`
3. Upload: `aws s3 sync frontend/dist s3://gamifyx-demo-[TIMESTAMP]`
4. Create CloudFront distribution pointing to S3
5. Update frontend env: `VITE_API_URL=https://api-[ALB-DNS]`

---

### Backend (Node.js + Express)

| Aspect | Local | Cloud | Migration |
|--------|-------|-------|-----------|
| Runtime | Node 18 local | ECS Fargate | Docker image pushed to ECR |
| Port | 5000 | 5000 (internal) | ALB routes traffic |
| Env vars | .env file | ECS task definition | Secrets Manager + task env |
| Health check | Manual | ALB target group | /api/health endpoint |
| Logs | stdout | CloudWatch | Auto-collected by ECS |

**Migration Steps:**
1. Build Docker image: `docker build -t gamifyx-backend:latest backend/`
2. Create ECR repo: `aws ecr create-repository --repository-name gamifyx-backend`
3. Push image: `docker tag gamifyx-backend:latest [ACCOUNT].dkr.ecr.[REGION].amazonaws.com/gamifyx-backend:latest`
4. Create ECS cluster, task definition, service
5. Attach ALB with target group pointing to ECS tasks

---

### Database (PostgreSQL)

| Aspect | Local | Cloud | Migration |
|--------|-------|-------|-----------|
| Host | localhost:5432 | RDS endpoint | Update DATABASE_URL |
| Credentials | user/password | Secrets Manager | Inject via task env |
| Backups | Manual | Automated daily | No action needed |
| Scaling | Manual | Auto-managed | No action needed |
| Migrations | Manual psql | Same (run in task) | Run migrations on first deploy |

**Migration Steps:**
1. Create RDS instance: `aws rds create-db-instance --db-instance-identifier gamifyx-db ...`
2. Wait for endpoint (5-10 min)
3. Create Secrets Manager secret with credentials
4. Update task definition with DATABASE_URL pointing to RDS endpoint
5. Run migrations: `npm run migrate` (in ECS task or local against RDS)

---

### Cache (Redis)

| Aspect | Local | Cloud | Migration |
|--------|-------|-------|-----------|
| Host | localhost:6379 | ElastiCache endpoint | Update REDIS_URL |
| Credentials | None | Security group + auth | Inject via task env |
| Persistence | None | Optional snapshots | Disabled for demo |
| Scaling | Manual | Auto-managed | No action needed |

**Migration Steps:**
1. Create ElastiCache cluster: `aws elasticache create-cache-cluster --cache-cluster-id gamifyx-redis ...`
2. Wait for endpoint (3-5 min)
3. Update task definition with REDIS_URL
4. Ensure security group allows ECS tasks to connect

---

## Environment Variable Mapping

### Local (.env)
```
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/gamifyx
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

### Cloud (ECS Task Definition)
```
PORT=5000
FRONTEND_URL=https://[CLOUDFRONT_DOMAIN]
DATABASE_URL=postgresql://user:password@[RDS_ENDPOINT]:5432/gamifyx
REDIS_URL=redis://[ELASTICACHE_ENDPOINT]:6379
JWT_SECRET=[FROM_SECRETS_MANAGER]
GITHUB_CLIENT_ID=[FROM_SECRETS_MANAGER]
GITHUB_CLIENT_SECRET=[FROM_SECRETS_MANAGER]
GITHUB_REDIRECT_URI=https://[ALB_DNS]/api/auth/github/callback
```

---

## Network & Security

### Security Groups

**ECS Tasks Security Group:**
- Inbound: Port 5000 from ALB security group
- Outbound: All (for RDS, ElastiCache, external APIs)

**RDS Security Group:**
- Inbound: Port 5432 from ECS security group
- Outbound: None needed

**ElastiCache Security Group:**
- Inbound: Port 6379 from ECS security group
- Outbound: None needed

**ALB Security Group:**
- Inbound: Port 80/443 from 0.0.0.0/0
- Outbound: Port 5000 to ECS security group

### VPC Setup
- Use default VPC (simplest for demo)
- All services in same VPC for internal communication
- RDS and ElastiCache in private subnets (optional, use public for demo speed)
