# Step-by-Step Executable Deployment Guide

## Prerequisites

```bash
# Install AWS CLI v2
# macOS: brew install awscliv2
# Verify: aws --version

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)

# Verify access
aws sts get-caller-identity
```

---

## Phase 1: Prepare Local Artifacts (30 min)

### 1.1 Build Frontend

```bash
cd frontend
npm install
npm run build
cd ..
# Output: frontend/dist/
```

### 1.2 Build Backend Docker Image

```bash
cd backend
npm install
npm run build
cd ..

# Build image
docker build -t gamifyx-backend:latest backend/

# Test locally (optional)
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  gamifyx-backend:latest
```

### 1.3 Set Environment Variables

```bash
# Create deployment config file
cat > deploy.env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME=gamifyx
ENVIRONMENT=demo
TIMESTAMP=$(date +%s)

# S3
S3_BUCKET_NAME=gamifyx-frontend-${TIMESTAMP}

# ECR
ECR_REPO_NAME=gamifyx-backend
ECR_IMAGE_TAG=latest

# RDS
RDS_DB_NAME=gamifyx
RDS_MASTER_USER=admin
RDS_MASTER_PASSWORD=GamifyX2024Demo!  # Change this!
RDS_INSTANCE_CLASS=db.t3.micro
RDS_ALLOCATED_STORAGE=20

# ElastiCache
REDIS_NODE_TYPE=cache.t3.micro
REDIS_NUM_CACHE_NODES=1

# ECS
ECS_CLUSTER_NAME=gamifyx-cluster
ECS_SERVICE_NAME=gamifyx-backend
ECS_TASK_FAMILY=gamifyx-backend
ECS_TASK_CPU=256
ECS_TASK_MEMORY=512
ECS_DESIRED_COUNT=1

# GitHub OAuth (update with your values)
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
EOF

source deploy.env
```

---

## Phase 2: Create AWS Infrastructure (60 min)

### 2.1 Create IAM Role for ECS Tasks

```bash
# Create trust policy
cat > ecs-task-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-trust-policy.json

# Attach policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create task role
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document file://ecs-task-trust-policy.json

# Attach policy for Secrets Manager access
aws iam attach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### 2.2 Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name $ECR_REPO_NAME \
  --region $AWS_REGION

# Get ECR login token and push image
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Tag and push
docker tag gamifyx-backend:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${ECR_IMAGE_TAG}

docker push \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${ECR_IMAGE_TAG}
```

### 2.3 Create RDS PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier gamifyx-db \
  --db-instance-class $RDS_INSTANCE_CLASS \
  --engine postgres \
  --engine-version 15.3 \
  --master-username $RDS_MASTER_USER \
  --master-user-password "$RDS_MASTER_PASSWORD" \
  --allocated-storage $RDS_ALLOCATED_STORAGE \
  --storage-type gp3 \
  --publicly-accessible \
  --no-multi-az \
  --backup-retention-period 7 \
  --region $AWS_REGION

# Wait for RDS to be available (5-10 minutes)
echo "Waiting for RDS instance to be available..."
aws rds wait db-instance-available \
  --db-instance-identifier gamifyx-db \
  --region $AWS_REGION

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier gamifyx-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region $AWS_REGION)

echo "RDS Endpoint: $RDS_ENDPOINT"
```

### 2.4 Create ElastiCache Redis Cluster

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id gamifyx-redis \
  --cache-node-type $REDIS_NODE_TYPE \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes $REDIS_NUM_CACHE_NODES \
  --port 6379 \
  --region $AWS_REGION

# Wait for ElastiCache to be available (3-5 minutes)
echo "Waiting for ElastiCache cluster to be available..."
aws elasticache wait cache-cluster-available \
  --cache-cluster-id gamifyx-redis \
  --region $AWS_REGION

# Get ElastiCache endpoint
REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id gamifyx-redis \
  --show-cache-node-info \
  --query 'CacheClusters[0].CacheNodes[0].Address' \
  --output text \
  --region $AWS_REGION)

echo "Redis Endpoint: $REDIS_ENDPOINT"
```

### 2.5 Create Secrets Manager Secrets

```bash
# Database credentials
aws secretsmanager create-secret \
  --name gamifyx/db \
  --secret-string "{\"username\":\"$RDS_MASTER_USER\",\"password\":\"$RDS_MASTER_PASSWORD\"}" \
  --region $AWS_REGION

# GitHub OAuth
aws secretsmanager create-secret \
  --name gamifyx/github \
  --secret-string "{\"client_id\":\"$GITHUB_CLIENT_ID\",\"client_secret\":\"$GITHUB_CLIENT_SECRET\"}" \
  --region $AWS_REGION

# JWT Secret
aws secretsmanager create-secret \
  --name gamifyx/jwt \
  --secret-string "{\"secret\":\"$(openssl rand -base64 32)\"}" \
  --region $AWS_REGION
```

### 2.6 Create VPC Security Groups

```bash
# Get default VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region $AWS_REGION)

# ALB Security Group
ALB_SG=$(aws ec2 create-security-group \
  --group-name gamifyx-alb-sg \
  --description "ALB security group for GamifyX" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

# Allow HTTP/HTTPS to ALB
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 \
  --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 \
  --region $AWS_REGION

# ECS Security Group
ECS_SG=$(aws ec2 create-security-group \
  --group-name gamifyx-ecs-sg \
  --description "ECS security group for GamifyX" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

# Allow traffic from ALB to ECS
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp --port 5000 \
  --source-group $ALB_SG \
  --region $AWS_REGION

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
  --group-name gamifyx-rds-sg \
  --description "RDS security group for GamifyX" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

# Allow traffic from ECS to RDS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp --port 5432 \
  --source-group $ECS_SG \
  --region $AWS_REGION

# ElastiCache Security Group
REDIS_SG=$(aws ec2 create-security-group \
  --group-name gamifyx-redis-sg \
  --description "ElastiCache security group for GamifyX" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

# Allow traffic from ECS to Redis
aws ec2 authorize-security-group-ingress \
  --group-id $REDIS_SG \
  --protocol tcp --port 6379 \
  --source-group $ECS_SG \
  --region $AWS_REGION

echo "ALB_SG=$ALB_SG"
echo "ECS_SG=$ECS_SG"
echo "RDS_SG=$RDS_SG"
echo "REDIS_SG=$REDIS_SG"
```

### 2.7 Modify RDS & ElastiCache Security Groups

```bash
# Modify RDS to use correct security group
aws rds modify-db-instance \
  --db-instance-identifier gamifyx-db \
  --vpc-security-group-ids $RDS_SG \
  --apply-immediately \
  --region $AWS_REGION

# Modify ElastiCache to use correct security group
aws elasticache modify-cache-cluster \
  --cache-cluster-id gamifyx-redis \
  --security-group-ids $REDIS_SG \
  --apply-immediately \
  --region $AWS_REGION
```

### 2.8 Create Application Load Balancer

```bash
# Get subnets
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[*].SubnetId' \
  --output text \
  --region $AWS_REGION)

# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name gamifyx-alb \
  --subnets $SUBNETS \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region $AWS_REGION)

echo "ALB_DNS=$ALB_DNS"

# Create target group
TG_ARN=$(aws elbv2 create-target-group \
  --name gamifyx-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id $VPC_ID \
  --health-check-enabled \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region $AWS_REGION
```

### 2.9 Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name $ECS_CLUSTER_NAME \
  --region $AWS_REGION
```

### 2.10 Create ECS Task Definition

```bash
# Create task definition JSON
cat > task-definition.json << EOF
{
  "family": "$ECS_TASK_FAMILY",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "$ECS_TASK_CPU",
  "memory": "$ECS_TASK_MEMORY",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "gamifyx-backend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${ECR_IMAGE_TAG}",
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PORT",
          "value": "5000"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://${S3_BUCKET_NAME}.s3.amazonaws.com"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://${RDS_MASTER_USER}:${RDS_MASTER_PASSWORD}@${RDS_ENDPOINT}:5432/${RDS_DB_NAME}"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://${REDIS_ENDPOINT}:6379"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gamifyx-backend",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

# Register task definition
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region $AWS_REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "Task Definition ARN: $TASK_DEF_ARN"
```

### 2.11 Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/gamifyx-backend \
  --region $AWS_REGION 2>/dev/null || true
```

### 2.12 Create ECS Service

```bash
# Get default subnets
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[*].SubnetId' \
  --output text \
  --region $AWS_REGION)

aws ecs create-service \
  --cluster $ECS_CLUSTER_NAME \
  --service-name $ECS_SERVICE_NAME \
  --task-definition $ECS_TASK_FAMILY \
  --desired-count $ECS_DESIRED_COUNT \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=gamifyx-backend,containerPort=5000" \
  --region $AWS_REGION
```

---

## Phase 3: Deploy Frontend (15 min)

### 3.1 Create S3 Bucket

```bash
aws s3 mb s3://$S3_BUCKET_NAME --region $AWS_REGION
```

### 3.2 Configure S3 for Static Website

```bash
# Enable static website hosting
aws s3 website s3://$S3_BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Create bucket policy for public read
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $S3_BUCKET_NAME \
  --policy file://bucket-policy.json
```

### 3.3 Upload Frontend Build

```bash
aws s3 sync frontend/dist s3://$S3_BUCKET_NAME \
  --delete \
  --cache-control "max-age=3600"
```

### 3.4 Create CloudFront Distribution

```bash
cat > cloudfront-config.json << EOF
{
  "CallerReference": "gamifyx-${TIMESTAMP}",
  "Comment": "GamifyX Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true
  },
  "Enabled": true
}
EOF

CLOUDFRONT_DOMAIN=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --query 'Distribution.DomainName' \
  --output text)

echo "CloudFront Domain: $CLOUDFRONT_DOMAIN"
```

---

## Phase 4: Verify Deployment (15 min)

### 4.1 Check ECS Service Status

```bash
aws ecs describe-services \
  --cluster $ECS_CLUSTER_NAME \
  --services $ECS_SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].[serviceName,status,desiredCount,runningCount]' \
  --output table
```

### 4.2 Check ALB Target Health

```bash
aws elbv2 describe-target-health \
  --target-group-arn $TG_ARN \
  --region $AWS_REGION \
  --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Reason]' \
  --output table
```

### 4.3 Test Backend Health

```bash
curl -v http://$ALB_DNS/api/health
```

### 4.4 Test Frontend Access

```bash
# Via CloudFront
curl -I https://$CLOUDFRONT_DOMAIN

# Via S3 directly
curl -I https://$S3_BUCKET_NAME.s3.amazonaws.com/index.html
```

---

## Save Configuration for Later

```bash
# Save all endpoints and IDs
cat > deployment-config.txt << EOF
=== GamifyX AWS Deployment Config ===
Timestamp: $TIMESTAMP
Region: $AWS_REGION

Frontend:
- S3 Bucket: $S3_BUCKET_NAME
- CloudFront Domain: $CLOUDFRONT_DOMAIN
- S3 Direct: https://$S3_BUCKET_NAME.s3.amazonaws.com

Backend:
- ALB DNS: $ALB_DNS
- ALB ARN: $ALB_ARN
- Target Group ARN: $TG_ARN
- ECS Cluster: $ECS_CLUSTER_NAME
- ECS Service: $ECS_SERVICE_NAME

Database:
- RDS Endpoint: $RDS_ENDPOINT
- RDS Database: $RDS_DB_NAME
- RDS User: $RDS_MASTER_USER

Cache:
- Redis Endpoint: $REDIS_ENDPOINT

Security Groups:
- ALB SG: $ALB_SG
- ECS SG: $ECS_SG
- RDS SG: $RDS_SG
- Redis SG: $REDIS_SG

ECR:
- Repository: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}

VPC:
- VPC ID: $VPC_ID
- Subnets: $SUBNETS
EOF

cat deployment-config.txt
```
