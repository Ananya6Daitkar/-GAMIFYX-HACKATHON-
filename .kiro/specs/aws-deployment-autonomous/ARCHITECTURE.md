# GamifyX AWS Deployment Architecture

## Final Architecture (Hackathon Optimized)

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │ Route 53 │ (DNS - optional, use IP for demo)
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼──┐      ┌──────▼──────┐   ┌────▼────┐
    │ S3   │      │ CloudFront  │   │ ALB     │
    │(SPA) │      │ (CDN)       │   │(Backend)│
    └──────┘      └─────────────┘   └────┬────┘
                                         │
                                    ┌────▼────────┐
                                    │ ECS Fargate │
                                    │ (Backend)   │
                                    └────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
              ┌─────▼────┐         ┌─────▼────┐        ┌─────▼────┐
              │ RDS      │         │ElastiCache│       │ ECR      │
              │PostgreSQL│         │ Redis    │       │(Images)  │
              └──────────┘         └──────────┘       └──────────┘
```

## Service Selection & Justification

| Component | Local | Cloud | Why This Choice |
|-----------|-------|-------|-----------------|
| Frontend | React dev server | S3 + CloudFront | Free tier eligible, CDN for speed, no server needed |
| Backend | Docker container | ECS Fargate | No EC2 management, pay-per-second, scales to zero |
| Database | PostgreSQL local | RDS PostgreSQL | Managed backups, no admin overhead, free tier (750h/mo) |
| Cache | Redis local | ElastiCache Redis | Managed, auto-failover, free tier (750h/mo) |
| Images | Local Docker | ECR | Private registry, integrated with ECS, free tier (500MB) |
| DNS | localhost | Route 53 (optional) | For demo: use ALB DNS directly, skip Route 53 |

## Cost Breakdown (Monthly)

| Service | Free Tier | Beyond Free | Demo Cost |
|---------|-----------|-------------|-----------|
| S3 | 5GB storage | $0.023/GB | ~$0.10 |
| CloudFront | 1TB egress | $0.085/GB | ~$0.50 |
| ECS Fargate | 750h vCPU + 3200GB memory | $0.04048/vCPU-h | ~$5-10 |
| RDS PostgreSQL | 750h db.t3.micro | $0.17/h beyond | ~$0 (within free tier) |
| ElastiCache Redis | 750h cache.t3.micro | $0.017/h beyond | ~$0 (within free tier) |
| ALB | 750h | $0.0225/h beyond | ~$0 (within free tier) |
| ECR | 500MB storage | $0.10/GB | ~$0.05 |
| **TOTAL** | | | **~$6-11/month** |

**Critical:** Delete all resources after demo to avoid charges beyond free tier.
