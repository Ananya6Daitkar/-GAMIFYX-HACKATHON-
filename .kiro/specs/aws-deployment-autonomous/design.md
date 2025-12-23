# AWS Deployment Specification - Design Document

## Overview

This design document specifies the architecture, components, and implementation strategy for deploying GamifyX to AWS. The solution prioritizes cost efficiency (AWS Free Tier), production-like reliability, and hackathon-ready demo capabilities. All infrastructure is created via CLI commands with no manual AWS console interaction required.

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└────────────────────────┬────────────────────────────────────┘
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

### Architecture Rationale

**Frontend: S3 + CloudFront**
- S3 hosts static React build (no server needed)
- CloudFront provides global CDN for fast delivery
- HTTPS automatic via CloudFront
- Free tier: 5GB storage + 1TB egress/month
- Alternative rejected: ALB for frontend (unnecessary complexity, higher cost)

**Backend: ECS Fargate**
- Serverless container orchestration (no EC2 management)
- Pay-per-second billing (cost-efficient for demos)
- Scales to zero when idle
- Integrated with ALB for load balancing
- Free tier: 750 vCPU-hours/month
- Alternative rejected: EC2 (requires instance management), Lambda (not suitable for long-running services)

**Database: RDS PostgreSQL**
- Managed database (no admin overhead)
- Automated backups and failover
- Free tier: 750 hours/month on db.t3.micro
- Alternative rejected: DynamoDB (requires schema redesign), self-managed PostgreSQL (admin overhead)

**Cache: ElastiCache Redis**
- Managed in-memory cache (no admin overhead)
- Auto-failover and replication
- Free tier: 750 hours/month on cache.t3.micro
- Alternative rejected: Self-managed Redis (admin overhead), Memcached (less feature-rich)

**Load Balancer: ALB**
- Application-aware routing (Layer 7)
- Health checks every 30 seconds
- Automatic target registration/deregistration
- Free tier: 750 hours/month
- Alternative rejected: NLB (overkill for this use case), Classic LB (deprecated)

**Container Registry: ECR**
- Private Docker image repository
- Integrated with ECS
- Free tier: 500MB storage
- Alternative rejected: Docker Hub (public, less integrated)

## Components and Interfaces

### Component 1: Frontend Deployment

**Responsibility:** Build and deploy React application to S3 + CloudFront

**Inputs:**
- React source code (frontend/)
- Build configuration (package.json, vite.config.ts)

**Outputs:**
- S3 bucket with static files
- CloudFront distribution with HTTPS
- Frontend URL (https://[CLOUDFRONT_DOMAIN])

**Interfaces:**
- AWS S3 API (create bucket, upload files, set policy)
- AWS CloudFront API (create distribution, invalidate cache)
- HTTP GET (frontend URL)

**Configuration:**
- S3 bucket name: gamifyx-frontend-[TIMESTAMP]
- CloudFront cache policy: 658327ea-f89d-4fab-a63d-7e88639e58f6 (managed policy)
- Index document: index.html
- Error document: index.html (for SPA routing)

### Component 2: Backend Deployment

**Responsibility:** Build Docker image, push to ECR, run on ECS Fargate

**Inputs:**
- Backend source code (backend/)
- Dockerfile
- Environment variables (DATABASE_URL, REDIS_URL, etc.)

**Outputs:**
- Docker image in ECR
- ECS task definition
- ECS service running on Fargate
- Backend URL (http://[ALB_DNS])

**Interfaces:**
- Docker CLI (build, tag, push)
- AWS ECR API (create repository, push image)
- AWS ECS API (register task definition, create service)
- AWS ALB API (create target group, register targets)
- HTTP GET (health endpoint: /api/health)

**Configuration:**
- ECR repository: gamifyx-backend
- ECS cluster: gamifyx-cluster
- ECS service: gamifyx-backend
- Task definition: gamifyx-backend
- Task CPU: 256 (0.25 vCPU)
- Task memory: 512 MB
- Container port: 5000
- Health check path: /api/health
- Health check interval: 30 seconds

### Component 3: Database Setup

**Responsibility:** Create and configure RDS PostgreSQL instance

**Inputs:**
- Database name: gamifyx
- Master username: admin
- Master password: [from deploy.env]

**Outputs:**
- RDS instance endpoint
- Database connection string (DATABASE_URL)

**Interfaces:**
- AWS RDS API (create instance, modify security groups)
- PostgreSQL client (psql for migrations)

**Configuration:**
- Instance class: db.t3.micro
- Engine: PostgreSQL 15.3
- Storage: 20 GB gp3
- Backup retention: 7 days
- Multi-AZ: No (for cost)
- Public accessibility: Yes (for demo simplicity)

### Component 4: Cache Setup

**Responsibility:** Create and configure ElastiCache Redis cluster

**Inputs:**
- Cluster ID: gamifyx-redis
- Node type: cache.t3.micro

**Outputs:**
- ElastiCache endpoint
- Cache connection string (REDIS_URL)

**Interfaces:**
- AWS ElastiCache API (create cluster, modify security groups)
- Redis client (redis-cli for testing)

**Configuration:**
- Node type: cache.t3.micro
- Engine: Redis 7.0
- Number of nodes: 1
- Port: 6379
- Automatic failover: Disabled (single node)

### Component 5: Networking & Security

**Responsibility:** Configure VPC, security groups, and network access

**Inputs:**
- VPC ID (default VPC)
- Subnet IDs (default subnets)

**Outputs:**
- Security groups for ALB, ECS, RDS, ElastiCache
- Network routing configured

**Interfaces:**
- AWS EC2 API (create security groups, authorize ingress/egress)
- AWS VPC API (describe VPCs, subnets)

**Configuration:**
- VPC: Default VPC
- Security groups:
  - ALB: Inbound 80/443 from 0.0.0.0/0
  - ECS: Inbound 5000 from ALB SG
  - RDS: Inbound 5432 from ECS SG
  - Redis: Inbound 6379 from ECS SG

### Component 6: Secrets Management

**Responsibility:** Store sensitive data securely

**Inputs:**
- Database credentials
- GitHub OAuth credentials
- JWT secret

**Outputs:**
- Secrets stored in AWS Secrets Manager
- ARNs for reference in task definition

**Interfaces:**
- AWS Secrets Manager API (create secret, get secret)

**Configuration:**
- Secrets:
  - gamifyx/db (username, password)
  - gamifyx/github (client_id, client_secret)
  - gamifyx/jwt (secret)

### Component 7: Monitoring & Logging

**Responsibility:** Collect logs and monitor service health

**Inputs:**
- ECS task logs (stdout/stderr)
- ALB access logs
- RDS performance metrics

**Outputs:**
- CloudWatch log group: /ecs/gamifyx-backend
- CloudWatch metrics for ECS, ALB, RDS

**Interfaces:**
- AWS CloudWatch API (create log group, put logs)
- AWS CloudWatch Logs API (tail logs)

**Configuration:**
- Log group: /ecs/gamifyx-backend
- Log retention: Indefinite (for demo)
- Metrics: ECS task count, ALB target health, RDS CPU

## Data Models

### Deployment Configuration

```typescript
interface DeploymentConfig {
  // AWS
  aws_region: string;
  aws_account_id: string;
  
  // Frontend
  s3_bucket_name: string;
  cloudfront_domain: string;
  cloudfront_distribution_id: string;
  
  // Backend
  ecr_repository_uri: string;
  ecr_image_tag: string;
  alb_dns: string;
  alb_arn: string;
  target_group_arn: string;
  
  // ECS
  ecs_cluster_name: string;
  ecs_service_name: string;
  ecs_task_family: string;
  ecs_task_cpu: number;
  ecs_task_memory: number;
  
  // Database
  rds_endpoint: string;
  rds_database_name: string;
  rds_master_user: string;
  
  // Cache
  redis_endpoint: string;
  
  // Security
  vpc_id: string;
  alb_security_group_id: string;
  ecs_security_group_id: string;
  rds_security_group_id: string;
  redis_security_group_id: string;
  
  // Metadata
  timestamp: number;
  environment: string;
}
```

### Environment Variables

```typescript
interface EnvironmentVariables {
  // Application
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  
  // Database
  DATABASE_URL: string;
  
  // Cache
  REDIS_URL: string;
  
  // Authentication
  JWT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_REDIRECT_URI: string;
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Infrastructure Idempotency
*For any* deployment configuration, running the deployment scripts multiple times should result in the same infrastructure state (no duplicate resources created).
**Validates: Requirements 1.1, 1.2**

### Property 2: Cost Stays Within Free Tier
*For any* deployment using the specified instance classes (db.t3.micro, cache.t3.micro, 256 CPU/512 MB), the monthly cost should remain within the AWS Free Tier limits (~$6-11/month).
**Validates: Requirements 2.1, 2.2**

### Property 3: All Services Are Healthy After Deployment
*For any* successful deployment, all services (backend, database, cache, load balancer) should report healthy status within 5 minutes of completion.
**Validates: Requirements 1.4, 10.1, 10.2, 10.3, 10.4**

### Property 4: Deployment Config Persists
*For any* deployment, the deployment configuration file should contain all endpoint URLs and resource IDs needed for future reference or cleanup.
**Validates: Requirements 1.2**

### Property 5: Security Groups Restrict Traffic Correctly
*For any* security group configuration, traffic should only flow between intended components (ALB→ECS, ECS→RDS, ECS→Redis) and not between unintended pairs.
**Validates: Requirements 5.4**

### Property 6: Frontend Loads from CloudFront
*For any* frontend deployment, accessing the CloudFront URL should return HTTP 200 with valid HTML content.
**Validates: Requirements 6.1, 10.2**

### Property 7: Backend Responds to Health Checks
*For any* backend deployment, the health endpoint (/api/health) should respond with HTTP 200 within 5 seconds.
**Validates: Requirements 6.2, 10.1**

### Property 8: Database Connection String Is Valid
*For any* RDS deployment, the DATABASE_URL should be correctly formatted and allow connections from ECS tasks.
**Validates: Requirements 6.3, 10.3**

### Property 9: Cache Connection String Is Valid
*For any* ElastiCache deployment, the REDIS_URL should be correctly formatted and allow connections from ECS tasks.
**Validates: Requirements 6.4, 10.4**

### Property 10: Environment Variables Are Injected
*For any* ECS task, all required environment variables should be present and correctly set in the task definition.
**Validates: Requirements 6.5**

### Property 11: Cleanup Script Deletes All Resources
*For any* cleanup execution, all AWS resources (S3, CloudFront, ECS, RDS, ElastiCache, security groups, IAM roles) should be deleted and no longer appear in AWS console.
**Validates: Requirements 9.2, 9.3**

### Property 12: Recovery Commands Fix Common Failures
*For any* common failure scenario (task crash, database unavailable, Redis unavailable, frontend not loading, ALB unhealthy), the provided recovery command should restore service health within 1 minute.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7**

## Error Handling

### Deployment Errors

**Error: AWS credentials not configured**
- Detection: `aws sts get-caller-identity` fails
- Recovery: Run `aws configure` and provide credentials
- Prevention: Check credentials before starting deployment

**Error: Docker image build fails**
- Detection: `docker build` returns non-zero exit code
- Recovery: Check build logs, fix source code, rebuild
- Prevention: Test build locally before deployment

**Error: ECR push fails**
- Detection: `docker push` returns non-zero exit code
- Recovery: Verify ECR repository exists, check Docker login
- Prevention: Verify ECR login before pushing

**Error: RDS creation times out**
- Detection: `aws rds wait db-instance-available` times out after 10 minutes
- Recovery: Check RDS console, verify security groups, retry
- Prevention: Ensure AWS account has RDS quota

**Error: ECS service fails to stabilize**
- Detection: `aws ecs wait services-stable` times out after 5 minutes
- Recovery: Check ECS task logs, verify security groups, check ALB health
- Prevention: Verify task definition is valid before creating service

### Runtime Errors

**Error: Backend task crashes**
- Detection: ECS task stops, ALB shows unhealthy target
- Recovery: `aws ecs update-service --force-new-deployment`
- Prevention: Monitor CloudWatch logs for errors

**Error: Database connection refused**
- Detection: Backend logs show "ECONNREFUSED" or "timeout"
- Recovery: Check RDS security group, verify ECS security group is allowed
- Prevention: Verify security groups before deployment

**Error: Redis connection refused**
- Detection: Backend logs show "ECONNREFUSED redis"
- Recovery: Check ElastiCache security group, verify ECS security group is allowed
- Prevention: Verify security groups before deployment

**Error: Frontend returns 403 Forbidden**
- Detection: CloudFront returns 403 when accessing S3
- Recovery: Check S3 bucket policy, verify public read access
- Prevention: Apply bucket policy during deployment

**Error: ALB shows unhealthy targets**
- Detection: `aws elbv2 describe-target-health` shows "unhealthy"
- Recovery: Check ECS task logs, verify health check path, restart service
- Prevention: Verify health check endpoint before deployment

## Testing Strategy

### Unit Testing

Unit tests verify specific components work correctly in isolation:

1. **Deployment Script Tests**
   - Verify each script creates expected resources
   - Verify error handling for common failures
   - Verify idempotency (running twice creates no duplicates)

2. **Configuration Tests**
   - Verify deploy.env is created with correct values
   - Verify deployment config file contains all required fields
   - Verify environment variables are correctly formatted

3. **Security Tests**
   - Verify security groups restrict traffic correctly
   - Verify no hardcoded credentials in scripts
   - Verify Secrets Manager is used for sensitive data

### Property-Based Testing

Property-based tests verify universal properties hold across all inputs:

1. **Property 1: Infrastructure Idempotency**
   - Run deployment scripts twice
   - Verify no duplicate resources created
   - Verify same endpoints returned both times

2. **Property 2: Cost Stays Within Free Tier**
   - Verify instance classes are Free Tier eligible
   - Calculate monthly cost based on configuration
   - Verify cost is within $6-11 range

3. **Property 3: All Services Are Healthy**
   - After deployment, check all service statuses
   - Verify health endpoints respond with HTTP 200
   - Verify database and cache are accessible

4. **Property 4: Deployment Config Persists**
   - After deployment, verify config file exists
   - Verify all required fields are present
   - Verify values match actual AWS resources

5. **Property 5: Security Groups Restrict Traffic**
   - Verify ALB security group allows 80/443 from 0.0.0.0/0
   - Verify ECS security group allows 5000 from ALB only
   - Verify RDS security group allows 5432 from ECS only
   - Verify Redis security group allows 6379 from ECS only

6. **Property 6: Frontend Loads from CloudFront**
   - Access CloudFront URL
   - Verify HTTP 200 response
   - Verify HTML content is valid

7. **Property 7: Backend Responds to Health Checks**
   - Access health endpoint
   - Verify HTTP 200 response
   - Verify response time < 5 seconds

8. **Property 8: Database Connection String Is Valid**
   - Parse DATABASE_URL
   - Verify format is correct
   - Verify connection from ECS task succeeds

9. **Property 9: Cache Connection String Is Valid**
   - Parse REDIS_URL
   - Verify format is correct
   - Verify connection from ECS task succeeds

10. **Property 10: Environment Variables Are Injected**
    - Describe ECS task definition
    - Verify all required environment variables are present
    - Verify values are correctly set

11. **Property 11: Cleanup Script Deletes All Resources**
    - Run cleanup script
    - Verify all resources are deleted
    - Verify AWS console shows no resources

12. **Property 12: Recovery Commands Fix Failures**
    - Simulate common failures
    - Run recovery commands
    - Verify services are restored to healthy state

### Integration Testing

Integration tests verify components work together correctly:

1. **End-to-End Deployment**
   - Run full deployment from start to finish
   - Verify all components are created
   - Verify all services are healthy
   - Verify frontend loads and backend responds

2. **Demo Scenario**
   - Run pre-demo checklist
   - Verify all URLs are accessible
   - Simulate common failures
   - Verify recovery commands work

3. **Cleanup Scenario**
   - Run cleanup script
   - Verify all resources are deleted
   - Verify no charges incurred

## Implementation Notes

### Deployment Phases

1. **Phase 1: IAM & ECR** (10 min)
   - Create IAM roles for ECS
   - Create ECR repository
   - Push Docker image

2. **Phase 2: Database & Cache** (15 min)
   - Create RDS PostgreSQL instance
   - Create ElastiCache Redis cluster
   - Create Secrets Manager secrets

3. **Phase 3: Networking** (5 min)
   - Create security groups
   - Configure ingress/egress rules

4. **Phase 4: Load Balancer** (5 min)
   - Create ALB
   - Create target group
   - Create listener

5. **Phase 5: ECS** (10 min)
   - Create ECS cluster
   - Register task definition
   - Create ECS service

6. **Phase 6: Frontend** (10 min)
   - Create S3 bucket
   - Upload frontend build
   - Create CloudFront distribution

### Deployment Automation

- All phases are automated via bash scripts
- Scripts are idempotent (safe to run multiple times)
- Scripts save configuration to deployment-config.txt
- Scripts provide clear error messages on failure

### Monitoring & Observability

- CloudWatch logs for all ECS tasks
- CloudWatch metrics for ECS, ALB, RDS
- Health checks every 30 seconds
- Automatic task restart on failure
- Manual recovery commands for common failures

### Cost Optimization

- All services use Free Tier eligible instance classes
- No multi-AZ (saves cost)
- No read replicas (saves cost)
- No auto-scaling policies (manual for demo)
- Cleanup script deletes all resources after demo
