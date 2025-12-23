# Cleanup & Cost Control

## CRITICAL: Delete After Hackathon

**⚠️ WARNING:** If you don't delete these resources, you WILL be charged beyond the free tier.

---

## Deletion Checklist (Run Immediately After Hackathon)

### Step 1: Delete ECS Service (2 min)

```bash
# Set desired count to 0
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --desired-count 0 \
  --region us-east-1

# Wait for tasks to stop
sleep 30

# Delete service
aws ecs delete-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --force \
  --region us-east-1

# Verify
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend \
  --region us-east-1 2>&1 | grep -i "does not exist" || echo "Service still exists"
```

### Step 2: Delete ECS Cluster (1 min)

```bash
aws ecs delete-cluster \
  --cluster gamifyx-cluster \
  --region us-east-1

# Verify
aws ecs describe-clusters \
  --clusters gamifyx-cluster \
  --region us-east-1 \
  --query 'clusters[0].status'
```

### Step 3: Delete Application Load Balancer (2 min)

```bash
# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names gamifyx-alb \
  --region us-east-1 \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Delete ALB
aws elbv2 delete-load-balancer \
  --load-balancer-arn $ALB_ARN \
  --region us-east-1

# Delete target group
TG_ARN=$(aws elbv2 describe-target-groups \
  --names gamifyx-tg \
  --region us-east-1 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

aws elbv2 delete-target-group \
  --target-group-arn $TG_ARN \
  --region us-east-1
```

### Step 4: Delete RDS Database (5 min)

```bash
# Delete without final snapshot (to save storage costs)
aws rds delete-db-instance \
  --db-instance-identifier gamifyx-db \
  --skip-final-snapshot \
  --region us-east-1

# Verify (will show "deleting" status)
aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --region us-east-1 \
  --query 'DBInstances[0].DBInstanceStatus'

# Wait for deletion (5-10 minutes)
echo "Waiting for RDS deletion..."
aws rds wait db-instance-deleted \
  --db-instance-identifier gamifyx-db \
  --region us-east-1 2>/dev/null || echo "RDS deleted"
```

### Step 5: Delete ElastiCache Cluster (3 min)

```bash
aws elasticache delete-cache-cluster \
  --cache-cluster-id gamifyx-redis \
  --region us-east-1

# Verify
aws elasticache describe-cache-clusters \
  --cache-cluster-id gamifyx-redis \
  --region us-east-1 \
  --query 'CacheClusters[0].CacheClusterStatus' 2>&1 | grep -i "deleting" || echo "Redis deleted"
```

### Step 6: Delete CloudFront Distribution (5 min)

```bash
# Get distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query 'DistributionList.Items[?Comment==`GamifyX Frontend Distribution`].Id' \
  --output text)

# Disable distribution first
aws cloudfront update-distribution \
  --id $DIST_ID \
  --distribution-config file://cloudfront-config-disabled.json \
  --region us-east-1

# Wait 5 minutes for propagation
echo "Waiting 5 minutes for CloudFront to disable..."
sleep 300

# Delete distribution
aws cloudfront delete-distribution \
  --id $DIST_ID \
  --etag [ETAG_FROM_PREVIOUS_COMMAND] \
  --region us-east-1
```

### Step 7: Delete S3 Bucket (1 min)

```bash
# Empty bucket first
aws s3 rm s3://gamifyx-frontend-[TIMESTAMP] --recursive

# Delete bucket
aws s3 rb s3://gamifyx-frontend-[TIMESTAMP]

# Verify
aws s3 ls | grep gamifyx-frontend || echo "S3 bucket deleted"
```

### Step 8: Delete ECR Repository (1 min)

```bash
# Delete all images first
aws ecr batch-delete-image \
  --repository-name gamifyx-backend \
  --image-ids imageTag=latest \
  --region us-east-1

# Delete repository
aws ecr delete-repository \
  --repository-name gamifyx-backend \
  --region us-east-1

# Verify
aws ecr describe-repositories \
  --repository-names gamifyx-backend \
  --region us-east-1 2>&1 | grep -i "does not exist" || echo "ECR repo still exists"
```

### Step 9: Delete Security Groups (2 min)

```bash
# Wait 5 minutes for ALB to fully delete before deleting security groups
sleep 300

# Delete security groups
aws ec2 delete-security-group --group-id [ALB_SG] --region us-east-1
aws ec2 delete-security-group --group-id [ECS_SG] --region us-east-1
aws ec2 delete-security-group --group-id [RDS_SG] --region us-east-1
aws ec2 delete-security-group --group-id [REDIS_SG] --region us-east-1

# Verify
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=gamifyx-*" \
  --region us-east-1 \
  --query 'SecurityGroups[*].GroupName'
```

### Step 10: Delete Secrets Manager Secrets (1 min)

```bash
# Delete secrets (with 7-day recovery window)
aws secretsmanager delete-secret \
  --secret-id gamifyx/db \
  --force-delete-without-recovery \
  --region us-east-1

aws secretsmanager delete-secret \
  --secret-id gamifyx/github \
  --force-delete-without-recovery \
  --region us-east-1

aws secretsmanager delete-secret \
  --secret-id gamifyx/jwt \
  --force-delete-without-recovery \
  --region us-east-1
```

### Step 11: Delete CloudWatch Logs (1 min)

```bash
aws logs delete-log-group \
  --log-group-name /ecs/gamifyx-backend \
  --region us-east-1
```

### Step 12: Delete IAM Roles (1 min)

```bash
# Detach policies first
aws iam detach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam detach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

# Delete roles
aws iam delete-role --role-name ecsTaskExecutionRole
aws iam delete-role --role-name ecsTaskRole

# Verify
aws iam list-roles --query 'Roles[?RoleName==`ecsTaskExecutionRole`]'
```

---

## Automated Cleanup Script

Save this as `cleanup.sh`:

```bash
#!/bin/bash

set -e

AWS_REGION=${AWS_REGION:-us-east-1}

echo "🗑️  Starting GamifyX AWS cleanup..."

# 1. ECS Service
echo "Deleting ECS service..."
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --desired-count 0 \
  --region $AWS_REGION 2>/dev/null || true

sleep 30

aws ecs delete-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --force \
  --region $AWS_REGION 2>/dev/null || true

# 2. ECS Cluster
echo "Deleting ECS cluster..."
aws ecs delete-cluster \
  --cluster gamifyx-cluster \
  --region $AWS_REGION 2>/dev/null || true

# 3. ALB & Target Group
echo "Deleting ALB..."
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names gamifyx-alb \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text 2>/dev/null) || true

if [ ! -z "$ALB_ARN" ]; then
  aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $AWS_REGION 2>/dev/null || true
fi

TG_ARN=$(aws elbv2 describe-target-groups \
  --names gamifyx-tg \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null) || true

if [ ! -z "$TG_ARN" ]; then
  aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $AWS_REGION 2>/dev/null || true
fi

# 4. RDS
echo "Deleting RDS database..."
aws rds delete-db-instance \
  --db-instance-identifier gamifyx-db \
  --skip-final-snapshot \
  --region $AWS_REGION 2>/dev/null || true

# 5. ElastiCache
echo "Deleting ElastiCache cluster..."
aws elasticache delete-cache-cluster \
  --cache-cluster-id gamifyx-redis \
  --region $AWS_REGION 2>/dev/null || true

# 6. S3
echo "Deleting S3 bucket..."
BUCKET=$(aws s3 ls | grep gamifyx-frontend | awk '{print $3}')
if [ ! -z "$BUCKET" ]; then
  aws s3 rm s3://$BUCKET --recursive --region $AWS_REGION 2>/dev/null || true
  aws s3 rb s3://$BUCKET --region $AWS_REGION 2>/dev/null || true
fi

# 7. ECR
echo "Deleting ECR repository..."
aws ecr batch-delete-image \
  --repository-name gamifyx-backend \
  --image-ids imageTag=latest \
  --region $AWS_REGION 2>/dev/null || true

aws ecr delete-repository \
  --repository-name gamifyx-backend \
  --region $AWS_REGION 2>/dev/null || true

# 8. Security Groups (wait for ALB deletion)
echo "Waiting for ALB deletion..."
sleep 300

echo "Deleting security groups..."
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=gamifyx-*" \
  --region $AWS_REGION \
  --query 'SecurityGroups[*].GroupId' \
  --output text | xargs -I {} aws ec2 delete-security-group --group-id {} --region $AWS_REGION 2>/dev/null || true

# 9. Secrets Manager
echo "Deleting secrets..."
aws secretsmanager delete-secret \
  --secret-id gamifyx/db \
  --force-delete-without-recovery \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager delete-secret \
  --secret-id gamifyx/github \
  --force-delete-without-recovery \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager delete-secret \
  --secret-id gamifyx/jwt \
  --force-delete-without-recovery \
  --region $AWS_REGION 2>/dev/null || true

# 10. CloudWatch Logs
echo "Deleting CloudWatch logs..."
aws logs delete-log-group \
  --log-group-name /ecs/gamifyx-backend \
  --region $AWS_REGION 2>/dev/null || true

# 11. IAM Roles
echo "Deleting IAM roles..."
aws iam detach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true

aws iam detach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite 2>/dev/null || true

aws iam delete-role --role-name ecsTaskExecutionRole 2>/dev/null || true
aws iam delete-role --role-name ecsTaskRole 2>/dev/null || true

echo "✅ Cleanup complete!"
echo "⚠️  Note: Some resources (RDS, ElastiCache) may take 5-10 minutes to fully delete."
```

Run it:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

## Cost Monitoring During Hackathon

### Check Current Charges

```bash
# Get billing info (requires Billing permission)
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --region us-east-1
```

### Free Tier Limits

| Service | Free Tier | Monitor |
|---------|-----------|---------|
| ECS Fargate | 750 vCPU-hours/month | `aws cloudwatch get-metric-statistics` |
| RDS | 750 hours/month | `aws rds describe-db-instances` |
| ElastiCache | 750 hours/month | `aws elasticache describe-cache-clusters` |
| ALB | 750 hours/month | `aws elbv2 describe-load-balancers` |
| S3 | 5GB storage | `aws s3 ls --recursive --summarize` |
| CloudFront | 1TB egress/month | AWS Console → CloudFront → Distributions |

---

## What NOT to Delete (Keep for Reference)

- Deployment config file (deployment-config.txt)
- Docker images (local, not in ECR)
- Source code (GitHub repo)
- Screenshots/recordings of demo

---

## Post-Cleanup Verification

```bash
# Verify everything is deleted
echo "=== ECS ==="
aws ecs list-clusters --region us-east-1

echo "=== RDS ==="
aws rds describe-db-instances --region us-east-1 --query 'DBInstances[*].DBInstanceIdentifier'

echo "=== ElastiCache ==="
aws elasticache describe-cache-clusters --region us-east-1 --query 'CacheClusters[*].CacheClusterId'

echo "=== ALB ==="
aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[*].LoadBalancerName'

echo "=== S3 ==="
aws s3 ls | grep gamifyx

echo "=== ECR ==="
aws ecr describe-repositories --region us-east-1 --query 'repositories[*].repositoryName'

echo "=== Security Groups ==="
aws ec2 describe-security-groups --filters "Name=group-name,Values=gamifyx-*" --region us-east-1 --query 'SecurityGroups[*].GroupName'

echo "=== IAM Roles ==="
aws iam list-roles --query 'Roles[?RoleName==`ecsTaskExecutionRole` || RoleName==`ecsTaskRole`].RoleName'
```

All should return empty or "No resources found".
