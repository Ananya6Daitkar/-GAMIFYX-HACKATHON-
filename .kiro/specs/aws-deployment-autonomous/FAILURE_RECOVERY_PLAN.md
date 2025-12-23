# Failure & Recovery Plan

## Quick Recovery Commands

### Scenario 1: Backend Task Crashed

**Symptoms:** ALB shows unhealthy targets, API returns 502/503

**Recovery (< 30 seconds):**
```bash
# Check task status
aws ecs describe-tasks \
  --cluster gamifyx-cluster \
  --tasks $(aws ecs list-tasks --cluster gamifyx-cluster --service-name gamifyx-backend --query 'taskArns[0]' --output text) \
  --query 'tasks[0].[taskArn,lastStatus,stoppedReason]'

# Force new deployment (restarts all tasks)
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --force-new-deployment \
  --region us-east-1

# Wait 30-60 seconds for new task to start
# Check health
curl http://[ALB_DNS]/api/health
```

---

### Scenario 2: Database Connection Timeout

**Symptoms:** Backend logs show "ECONNREFUSED" or "timeout", API returns 500

**Recovery (< 1 minute):**
```bash
# 1. Verify RDS is running
aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]'

# Expected: "available" status

# 2. Check security group allows ECS → RDS
aws ec2 describe-security-groups \
  --group-ids [RDS_SG] \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5432`]'

# Expected: Should show rule allowing ECS security group

# 3. If security group is wrong, fix it
aws ec2 authorize-security-group-ingress \
  --group-id [RDS_SG] \
  --protocol tcp \
  --port 5432 \
  --source-group [ECS_SG] \
  --region us-east-1

# 4. Restart ECS service to reconnect
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --force-new-deployment \
  --region us-east-1

# 5. Verify connection
curl http://[ALB_DNS]/api/health
```

---

### Scenario 3: Redis Connection Failed

**Symptoms:** Backend logs show "ECONNREFUSED redis", but app still works (cache miss)

**Recovery (< 1 minute):**
```bash
# 1. Check ElastiCache status
aws elasticache describe-cache-clusters \
  --cache-cluster-id gamifyx-redis \
  --show-cache-node-info \
  --query 'CacheClusters[0].[CacheClusterStatus,CacheNodes[0].Address]'

# Expected: "available" status

# 2. Check security group
aws ec2 describe-security-groups \
  --group-ids [REDIS_SG] \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`6379`]'

# 3. If needed, fix security group
aws ec2 authorize-security-group-ingress \
  --group-id [REDIS_SG] \
  --protocol tcp \
  --port 6379 \
  --source-group [ECS_SG] \
  --region us-east-1

# 4. Restart ECS service
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --force-new-deployment \
  --region us-east-1

# Note: App will work without Redis (just slower), so this is lower priority
```

---

### Scenario 4: Frontend Not Loading / CloudFront Issues

**Symptoms:** HTTPS timeout, 403 Forbidden, or stale content

**Recovery (< 2 minutes):**
```bash
# 1. Check S3 bucket is accessible
aws s3 ls s3://[S3_BUCKET_NAME]/index.html

# 2. Check S3 bucket policy
aws s3api get-bucket-policy --bucket [S3_BUCKET_NAME]

# 3. If policy is missing, re-apply it
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket [S3_BUCKET_NAME] \
  --policy file://bucket-policy.json

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id [DISTRIBUTION_ID] \
  --paths "/*"

# 5. Wait 30 seconds and refresh browser
```

---

### Scenario 5: ALB Not Routing Traffic

**Symptoms:** Connection refused to ALB DNS, or 503 Service Unavailable

**Recovery (< 2 minutes):**
```bash
# 1. Check ALB exists and is active
aws elbv2 describe-load-balancers \
  --names gamifyx-alb \
  --query 'LoadBalancers[0].[LoadBalancerName,State.Code]'

# Expected: "active"

# 2. Check target group has healthy targets
aws elbv2 describe-target-health \
  --target-group-arn [TG_ARN] \
  --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Reason]'

# Expected: At least one "healthy" target

# 3. If no healthy targets, check ECS service
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --query 'services[0].[runningCount,desiredCount]'

# If runningCount < desiredCount, restart service
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --desired-count 1 \
  --region us-east-1

# 4. Wait 60 seconds for task to start and register with ALB
# 5. Test ALB
curl -v http://[ALB_DNS]/api/health
```

---

### Scenario 6: Out of Memory / Task Crashes

**Symptoms:** ECS task stops after 30-60 seconds, logs show "OOM" or "killed"

**Recovery (< 5 minutes):**
```bash
# 1. Check task definition memory
aws ecs describe-task-definition \
  --task-definition gamifyx-backend \
  --query 'taskDefinition.[cpu,memory]'

# Current: 256 CPU, 512 MB memory

# 2. If consistently crashing, increase memory
# Create new task definition with more memory (1024 MB)
# (See STEP_BY_STEP_DEPLOYMENT.md for full task definition)

# 3. Update service to use new task definition
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --task-definition gamifyx-backend:2 \
  --region us-east-1

# 4. Monitor logs
aws logs tail /ecs/gamifyx-backend --follow
```

---

### Scenario 7: High Latency / Slow Responses

**Symptoms:** API responses take > 5 seconds, frontend feels sluggish

**Recovery (< 5 minutes):**
```bash
# 1. Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=app/gamifyx-alb/[ID] \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average

# 2. Check backend logs for slow queries
aws logs tail /ecs/gamifyx-backend --follow | grep -i "slow\|duration"

# 3. Check RDS performance
aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --query 'DBInstances[0].[DBInstanceStatus,AllocatedStorage,DBInstanceClass]'

# 4. If RDS is undersized, upgrade instance class
# (This requires downtime, so do during non-demo time)

# 5. For immediate relief, scale up ECS tasks
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --desired-count 2 \
  --region us-east-1
```

---

## Monitoring Dashboard (Run During Demo)

```bash
# Create a monitoring loop to watch during demo
watch -n 5 'echo "=== ECS Service ===" && \
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --query "services[0].[serviceName,status,runningCount,desiredCount]" \
  --output table && \
echo "=== ALB Targets ===" && \
aws elbv2 describe-target-health \
  --target-group-arn [TG_ARN] \
  --query "TargetHealthDescriptions[*].[Target.Id,TargetHealth.State]" \
  --output table && \
echo "=== RDS Status ===" && \
aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --query "DBInstances[0].[DBInstanceStatus,Endpoint.Address]" \
  --output table'
```

---

## Rollback Strategy

### If Deployment Goes Wrong

```bash
# 1. Revert to previous task definition
# List previous versions
aws ecs describe-task-definition \
  --task-definition gamifyx-backend \
  --query 'taskDefinition.revision'

# 2. Update service to use previous revision
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --task-definition gamifyx-backend:1 \
  --region us-east-1

# 3. Wait for rollout
aws ecs wait services-stable \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --region us-east-1

# 4. Verify
curl http://[ALB_DNS]/api/health
```

---

## Emergency Shutdown (If Needed)

```bash
# Stop all tasks immediately
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --desired-count 0 \
  --region us-east-1

# Verify
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --query 'services[0].runningCount'

# Expected: 0
```

---

## Health Check Endpoints

### Backend Health
```bash
curl http://[ALB_DNS]/api/health
# Expected: {"status":"ok"} or similar
```

### Database Connectivity
```bash
# From ECS task logs
aws logs tail /ecs/gamifyx-backend --follow | grep -i "database\|connected"
```

### Redis Connectivity
```bash
# From ECS task logs
aws logs tail /ecs/gamifyx-backend --follow | grep -i "redis\|cache"
```

### Frontend Availability
```bash
curl -I https://[CLOUDFRONT_DOMAIN]
# Expected: HTTP 200
```

---

## Prevention Tips

1. **Before Demo:**
   - Run all health checks 30 min before
   - Have deployment config file open
   - Test each component individually

2. **During Demo:**
   - Keep terminal open with monitoring dashboard
   - Have rollback commands ready
   - Don't make changes during demo

3. **After Demo:**
   - Check logs for any errors
   - Document issues for post-hackathon analysis
   - Delete resources to avoid charges
