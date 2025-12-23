# Quick Start (TL;DR)

## For the Impatient: 2-3 Hour Deployment

### Prerequisites (10 min)
```bash
# 1. Install AWS CLI
brew install awscliv2

# 2. Configure credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output (json)

# 3. Verify
aws sts get-caller-identity
```

### Build Artifacts (30 min)
```bash
# Frontend
cd frontend && npm install && npm run build && cd ..

# Backend
cd backend && npm install && npm run build && cd ..

# Docker image
docker build -t gamifyx-backend:latest backend/
```

### Deploy to AWS (90 min)
```bash
# Source the deployment config
source deploy.env  # Create this from STEP_BY_STEP_DEPLOYMENT.md

# Run deployment script (see below)
bash deploy-all.sh
```

---

## One-Command Deployment Script

Save as `deploy-all.sh`:

```bash
#!/bin/bash
set -e

# Load config
source deploy.env

echo "🚀 Starting GamifyX AWS deployment..."

# Phase 1: IAM & ECR
echo "📦 Setting up IAM and ECR..."
bash scripts/01-iam-ecr.sh

# Phase 2: Database & Cache
echo "🗄️  Setting up RDS and ElastiCache..."
bash scripts/02-database-cache.sh

# Phase 3: Networking
echo "🌐 Setting up VPC and security groups..."
bash scripts/03-networking.sh

# Phase 4: Load Balancer
echo "⚖️  Setting up ALB..."
bash scripts/04-alb.sh

# Phase 5: ECS
echo "🐳 Setting up ECS..."
bash scripts/05-ecs.sh

# Phase 6: Frontend
echo "🎨 Deploying frontend..."
bash scripts/06-frontend.sh

echo "✅ Deployment complete!"
echo "Frontend: https://[CLOUDFRONT_DOMAIN]"
echo "Backend: http://[ALB_DNS]"
```

---

## Minimal Deployment (Fastest Path)

If you want to skip some steps:

### Option A: Backend Only (No Frontend)
```bash
# Just deploy backend API
# Useful for testing backend before frontend

# Skip: S3, CloudFront, frontend build
# Do: ECR, RDS, ElastiCache, ALB, ECS
```

### Option B: Frontend Only (Use Local Backend)
```bash
# Just deploy frontend to S3 + CloudFront
# Keep backend running locally

# Skip: RDS, ElastiCache, ALB, ECS
# Do: S3, CloudFront, frontend build
```

### Option C: Everything in One VPC (Simplest)
```bash
# Use default VPC, public subnets
# Skip: VPC creation, private subnets
# Faster but less secure (fine for demo)
```

---

## Demo URLs

After deployment, you'll have:

```
Frontend: https://gamifyx-frontend-[TIMESTAMP].cloudfront.net
Backend API: http://gamifyx-alb-[RANDOM].us-east-1.elb.amazonaws.com
Health Check: http://gamifyx-alb-[RANDOM].us-east-1.elb.amazonaws.com/api/health
```

---

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| Backend not responding | `aws ecs update-service --cluster gamifyx-cluster --service gamifyx-backend --force-new-deployment` |
| Database connection error | Check security group: `aws ec2 describe-security-groups --group-ids [RDS_SG]` |
| Frontend not loading | Invalidate CloudFront: `aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"` |
| ALB shows unhealthy | Check ECS task logs: `aws logs tail /ecs/gamifyx-backend --follow` |
| Out of memory | Increase task memory in task definition (512MB → 1024MB) |

---

## Cost Check

```bash
# Estimate monthly cost
echo "ECS Fargate: ~$5-10"
echo "RDS: ~$0 (free tier)"
echo "ElastiCache: ~$0 (free tier)"
echo "ALB: ~$0 (free tier)"
echo "S3: ~$0.10"
echo "CloudFront: ~$0.50"
echo "---"
echo "TOTAL: ~$6-11/month"
```

---

## Delete Everything After Demo

```bash
bash cleanup.sh
```

---

## Full Documentation

- **Architecture**: See ARCHITECTURE.md
- **Detailed Steps**: See STEP_BY_STEP_DEPLOYMENT.md
- **Demo Flow**: See LIVE_DEMO_FLOW.md
- **Failures**: See FAILURE_RECOVERY_PLAN.md
- **Cleanup**: See CLEANUP_AND_COST_CONTROL.md

---

## Support

If stuck:
1. Check CloudWatch logs: `aws logs tail /ecs/gamifyx-backend --follow`
2. Check ECS task status: `aws ecs describe-tasks --cluster gamifyx-cluster --tasks [TASK_ARN]`
3. Check ALB health: `aws elbv2 describe-target-health --target-group-arn [TG_ARN]`
4. Check RDS status: `aws rds describe-db-instances --db-instance-identifier gamifyx-db`

---

## Timeline

| Phase | Time | What |
|-------|------|------|
| 1 | 10 min | AWS CLI setup |
| 2 | 30 min | Build frontend & backend |
| 3 | 60 min | Deploy to AWS |
| 4 | 15 min | Verify & test |
| **Total** | **~2 hours** | **Live on AWS** |

---

## Next Steps

1. ✅ Read this file
2. ✅ Read ARCHITECTURE.md to understand the design
3. ✅ Follow STEP_BY_STEP_DEPLOYMENT.md step-by-step
4. ✅ Use LIVE_DEMO_FLOW.md during demo
5. ✅ Run cleanup.sh after hackathon

Good luck! 🚀
