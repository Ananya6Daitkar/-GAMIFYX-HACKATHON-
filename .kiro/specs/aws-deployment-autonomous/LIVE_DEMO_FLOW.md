# Live Demo Flow for Hackathon

## Pre-Demo Checklist (Run 30 min before demo)

```bash
# 1. Verify all services are running
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --region us-east-1 \
  --query 'services[0].runningCount'

# Expected output: 1 (or higher)

# 2. Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn [YOUR_TG_ARN] \
  --region us-east-1 \
  --query 'TargetHealthDescriptions[0].TargetHealth.State'

# Expected output: "healthy"

# 3. Test backend connectivity
curl -s http://[ALB_DNS]/api/health | jq .

# Expected output: {"status":"ok"} or similar

# 4. Test frontend loads
curl -s https://[CLOUDFRONT_DOMAIN] | head -20

# Expected output: HTML with React app
```

---

## Demo Script (5-10 minutes)

### Opening (1 min)
"GamifyX is an AI-powered gamified learning platform. Today, I'm showing you the production deployment running on AWS. This is NOT running locally—it's live in the cloud."

### Show Architecture (1 min)
Display the architecture diagram from ARCHITECTURE.md:
- "Frontend is served from CloudFront CDN for global speed"
- "Backend API runs on ECS Fargate—serverless containers"
- "Database is managed RDS PostgreSQL"
- "Cache layer with ElastiCache Redis"

### Demo Flow (5-7 min)

#### Step 1: Open Frontend (1 min)
```
URL: https://[CLOUDFRONT_DOMAIN]
```
- Show the login page
- Explain: "This is served from S3 + CloudFront, deployed from our React build"
- Point out the URL is HTTPS and from AWS domain

#### Step 2: Login & Navigate (2 min)
- Login with demo credentials
- Navigate to Dashboard
- Show Leaderboard
- Show Assignments
- Explain: "All data is coming from our backend API running on ECS Fargate"

#### Step 3: Show Real-Time Features (1 min)
- If you have real-time features (WebSocket via Socket.io):
  - Open browser DevTools → Network → WS
  - Show WebSocket connection to ALB
  - Explain: "Real-time updates via Socket.io, connected to our cloud backend"

#### Step 4: Show Analytics/Data (1 min)
- Navigate to Analytics page
- Show data being fetched from cloud database
- Explain: "This data is stored in RDS PostgreSQL, cached with Redis"

#### Step 5: Prove It's Cloud (1 min)
Open terminal during demo:
```bash
# Show the ALB DNS
echo "Backend running at: http://[ALB_DNS]"

# Show RDS is running
aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]' \
  --output table

# Show ElastiCache is running
aws elasticache describe-cache-clusters \
  --cache-cluster-id gamifyx-redis \
  --show-cache-node-info \
  --query 'CacheClusters[0].[CacheClusterId,CacheClusterStatus,CacheNodes[0].Address]' \
  --output table
```

---

## Key Talking Points

1. **Cost Efficiency**
   - "Entire stack costs ~$6-11/month using AWS Free Tier"
   - "ECS Fargate scales to zero when not in use"
   - "No EC2 instances to manage"

2. **Scalability**
   - "If traffic spikes, ECS auto-scales horizontally"
   - "RDS handles backups automatically"
   - "CloudFront caches content globally"

3. **Reliability**
   - "ALB health checks ensure backend is always healthy"
   - "RDS automated backups every day"
   - "If a task crashes, ECS restarts it automatically"

4. **DevOps Best Practices**
   - "Infrastructure as Code (all CLI commands)"
   - "Secrets Manager for sensitive data"
   - "CloudWatch logs for monitoring"
   - "Docker for consistent deployments"

---

## Demo Failure Recovery (< 1 minute)

### If Backend is Down
```bash
# Check service status
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --region us-east-1

# If runningCount = 0, restart service
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --desired-count 1 \
  --region us-east-1

# Wait 30-60 seconds for task to start
```

### If Database Connection Fails
```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --query 'DBInstances[0].DBInstanceStatus'

# If "available", check security group
aws ec2 describe-security-groups \
  --group-ids [RDS_SG] \
  --query 'SecurityGroups[0].IpPermissions'

# Verify ECS task can reach RDS
# (This is harder to debug live, so have a backup plan)
```

### If Frontend is Slow
```bash
# CloudFront invalidation (clears cache)
aws cloudfront create-invalidation \
  --distribution-id [DISTRIBUTION_ID] \
  --paths "/*"

# Or just refresh browser (CloudFront should serve from cache)
```

### Fallback: Show Local Version
If cloud deployment fails completely:
```bash
# Run locally as backup
docker-compose up -d
# Open http://localhost:3000
# Explain: "This is the same app running locally for comparison"
```

---

## Post-Demo Checklist

### Immediately After Demo
1. Take screenshots of the live URLs
2. Save the deployment config file
3. Note any issues encountered

### Before Leaving Demo Area
1. Verify all services are still running
2. Check CloudWatch logs for errors
3. Document any performance issues

### After Hackathon (IMPORTANT: Avoid Charges)
See CLEANUP_AND_COST_CONTROL.md for deletion steps.

---

## Demo URLs Quick Reference

```
Frontend: https://[CLOUDFRONT_DOMAIN]
Backend API: http://[ALB_DNS]
Backend Health: http://[ALB_DNS]/api/health

AWS Console Links:
- ECS: https://console.aws.amazon.com/ecs/v2/clusters/gamifyx-cluster
- RDS: https://console.aws.amazon.com/rds/v2/instances/gamifyx-db
- ElastiCache: https://console.aws.amazon.com/elasticache/home#cache-clusters:id=gamifyx-redis
- CloudFront: https://console.aws.amazon.com/cloudfront/v3/home#/distributions
- S3: https://console.aws.amazon.com/s3/buckets/gamifyx-frontend-[TIMESTAMP]
```

---

## Talking Points for Judges

**Q: How is this different from running locally?**
A: "Everything is deployed on AWS managed services. The frontend is globally distributed via CloudFront, the backend auto-scales on Fargate, and the database is managed RDS with automatic backups."

**Q: What about cost?**
A: "Using AWS Free Tier, this costs about $6-11/month. In production, we'd add auto-scaling policies and monitoring."

**Q: How do you handle failures?**
A: "ECS automatically restarts failed tasks. ALB health checks ensure only healthy instances receive traffic. RDS has automated backups."

**Q: Can you scale this?**
A: "Yes. We can increase ECS task count, upgrade RDS instance class, or add read replicas. CloudFront already scales globally."

**Q: How long did deployment take?**
A: "About 2-3 hours from local setup to cloud deployment, including infrastructure creation and testing."
