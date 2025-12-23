# Demo Quick Reference Card

## Pre-Demo (30 min before)

```bash
# 1. Verify backend is healthy
curl http://[ALB_DNS]/api/health

# 2. Verify frontend loads
curl -I https://[CLOUDFRONT_DOMAIN]

# 3. Check ECS service
aws ecs describe-services --cluster gamifyx-cluster --services gamifyx-backend

# 4. Check ALB targets
aws elbv2 describe-target-health --target-group-arn [TG_ARN]
```

---

## Demo URLs (Keep These Open)

| URL | Purpose |
|-----|---------|
| https://[CLOUDFRONT_DOMAIN] | Frontend (main demo) |
| http://[ALB_DNS]/api/health | Backend health check |
| http://[ALB_DNS] | Backend API |

---

## Demo Script (5-10 min)

### 1. Opening (1 min)
"GamifyX is an AI-powered gamified learning platform. This is running on AWS—not locally."

### 2. Architecture (1 min)
Show ARCHITECTURE.md diagram. Explain:
- Frontend: S3 + CloudFront
- Backend: ECS Fargate
- Database: RDS PostgreSQL
- Cache: ElastiCache Redis

### 3. Live Demo (5-7 min)
- Open frontend URL
- Login and navigate
- Show Dashboard, Leaderboard, Assignments
- Show real-time features (if available)

### 4. Prove It's Cloud (1 min)
Run these commands:
```bash
aws rds describe-db-instances --db-instance-identifier gamifyx-db
aws elasticache describe-cache-clusters --cache-cluster-id gamifyx-redis
```

---

## Key Talking Points

| Topic | Point |
|-------|-------|
| **Cost** | ~$6-11/month using AWS Free Tier |
| **Scalability** | ECS scales from 1 to N tasks automatically |
| **Reliability** | Auto-restart on failure, health checks every 30s |
| **DevOps** | Infrastructure as Code, Secrets Manager, CloudWatch |
| **Time** | 2-3 hours from local to cloud deployment |

---

## Recovery Commands (< 1 min fixes)

### Backend Down
```bash
aws ecs update-service --cluster gamifyx-cluster --service gamifyx-backend --force-new-deployment
```

### Frontend Slow
```bash
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

### Check Logs
```bash
aws logs tail /ecs/gamifyx-backend --follow
```

### Check Services
```bash
# RDS
aws rds describe-db-instances --db-instance-identifier gamifyx-db

# ElastiCache
aws elasticache describe-cache-clusters --cache-cluster-id gamifyx-redis

# ECS
aws ecs describe-services --cluster gamifyx-cluster --services gamifyx-backend
```

---

## Judge Q&A

**Q: How is this different from local?**
A: "Everything is on AWS managed services. Frontend is globally distributed via CloudFront. Backend auto-scales on Fargate. Database is managed RDS."

**Q: What about cost?**
A: "~$6-11/month using Free Tier. We use managed services, so we only pay for what we use."

**Q: How do you handle failures?**
A: "ECS auto-restarts tasks. ALB health checks route to healthy instances. RDS has automated backups."

**Q: Can you scale this?**
A: "Yes. Increase ECS tasks, upgrade RDS, add read replicas. CloudFront scales globally."

**Q: How long did deployment take?**
A: "2-3 hours from local to cloud. Most time is waiting for AWS services."

---

## Demo Confidence Checklist

- [ ] Frontend loads
- [ ] Backend responds
- [ ] All AWS resources running
- [ ] No CloudWatch errors
- [ ] ALB shows healthy
- [ ] Recovery commands ready
- [ ] Deployment config saved
- [ ] AWS console links ready
- [ ] Demo script practiced
- [ ] Talking points memorized

---

## AWS Console Links

```
ECS: https://console.aws.amazon.com/ecs/v2/clusters/gamifyx-cluster
RDS: https://console.aws.amazon.com/rds/v2/instances/gamifyx-db
ElastiCache: https://console.aws.amazon.com/elasticache/home#cache-clusters:id=gamifyx-redis
CloudFront: https://console.aws.amazon.com/cloudfront/v3/home#/distributions
S3: https://console.aws.amazon.com/s3/buckets/gamifyx-frontend-[TIMESTAMP]
```

---

## You're Ready! 🚀

Print this card and keep it handy during demo day.

**Good luck! 🎉**
