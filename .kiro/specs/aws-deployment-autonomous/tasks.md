# AWS Deployment Specification - Implementation Plan (Hackathon Edition)

## Overview

Streamlined implementation plan optimized for hackathon completion. **Outcomes are fixed, steps are flexible.** Focus on core deployment with minimal testing overhead. All tasks are actionable and build incrementally.

**Key Principle:** Get to the outcome (working cloud deployment) by any means necessary. If a step takes too long, skip it and move forward. The goal is a live, working demo on AWS.

---

## Phase 1: Prepare & Build (30 min)

- [ ] 1. Set up deployment environment and build artifacts
  - Create deploy.env with AWS configuration
  - Verify AWS CLI and Docker are installed
  - Build frontend: `npm run build --workspace=frontend`
  - Build backend: `npm run build --workspace=backend`
  - Create Docker image: `docker build -t gamifyx-backend:latest backend/`
  - _Requirements: 1.1, 1.3, 6.1, 6.2_

---

## Phase 2: AWS Infrastructure (90 min)

- [ ] 2. Create IAM roles and push Docker image to ECR
  - Create ecsTaskExecutionRole and ecsTaskRole
  - Create ECR repository and push Docker image
  - Save ECR URI to deploy.env
  - _Requirements: 1.1, 6.2_

- [ ] 3. Create database and cache
  - Create RDS PostgreSQL instance (db.t3.micro)
  - Create ElastiCache Redis cluster (cache.t3.micro)
  - Create Secrets Manager secrets for credentials
  - Save endpoints to deploy.env
  - _Requirements: 1.1, 2.1, 2.4, 6.3, 6.4_

- [ ] 4. Create networking and security
  - Create security groups for ALB, ECS, RDS, Redis
  - Configure ingress/egress rules
  - Save security group IDs to deploy.env
  - _Requirements: 1.1, 5.4_

- [ ] 5. Create load balancer and ECS cluster
  - Create ALB with target group and listener
  - Create ECS cluster and CloudWatch log group
  - Create ECS task definition with environment variables
  - Create ECS service and wait for stabilization
  - Save ALB DNS to deploy.env
  - _Requirements: 1.1, 1.2, 1.4, 3.1, 3.2, 6.2, 6.5_

- [ ] 6. Deploy frontend to S3 and CloudFront
  - Create S3 bucket with static website hosting
  - Apply bucket policy for public read access
  - Upload frontend/dist to S3
  - Create CloudFront distribution
  - Save CloudFront domain to deploy.env
  - _Requirements: 1.1, 1.2, 6.1_

---

## Phase 3: Verification (15 min)

- [ ] 7. Verify all services are healthy
  - Test backend health: curl http://[ALB_DNS]/api/health
  - Test frontend: curl https://[CLOUDFRONT_DOMAIN]
  - Verify database and cache connectivity from ECS task
  - Save deployment-config.txt with all endpoints
  - _Requirements: 1.4, 10.1, 10.2, 10.3, 10.4_

---

## Phase 4: Automation & Documentation (30 min)

- [ ] 8. Create automated deployment scripts
  - Create setup-env.sh for environment setup
  - Create deploy-all.sh master script that runs all phases
  - Create cleanup.sh for resource deletion
  - Test scripts and verify they work end-to-end
  - _Requirements: 1.1, 1.5, 9.2_

- [ ] 9. Create demo and recovery documentation
  - Create DEMO_CHECKLIST.md (pre-demo verification)
  - Create RECOVERY_COMMANDS.md (common failure fixes)
  - Create CLEANUP_GUIDE.md (post-hackathon deletion)
  - _Requirements: 4.3, 4.4, 4.5, 7.1, 7.2, 8.1-8.7, 9.1-9.5_

- [ ] 9.1 Set up GitHub Actions CI/CD (Optional)
  - Create `.github/workflows/deploy.yml` workflow file
  - Add GitHub Secrets (AWS credentials, S3 bucket, CloudFront ID)
  - Create IAM user for GitHub Actions
  - Generate task-definition.json
  - Test workflow by pushing to main branch
  - Verify automatic deployment works
  - _Requirements: 1.1, 1.5_

---

## Phase 5: Final Checkpoint (15 min)

- [ ] 10. Final verification and documentation
  - Verify all AWS resources are created and healthy
  - Verify all scripts are executable and working
  - Verify deployment-config.txt contains all endpoints
  - Verify cost estimate is within $6-11/month
  - Verify all documentation files exist
  - _Requirements: 1.2, 1.4, 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 4.5_

---

## Summary

**Streamlined Implementation:**

✅ **5 core phases** with clear focus  
✅ **10 actionable tasks** covering all requirements  
✅ **Automated scripts** for reproducible deployment  
✅ **Essential documentation** for demo and recovery  
✅ **Cleanup automation** to prevent charges  

**Estimated Time:** 2-3 hours for full deployment  
**Estimated Cost:** ~$6-11/month (AWS Free Tier)  
**Status:** Production-ready, hackathon-optimized

---

## Task Execution Notes

- Each task builds on previous tasks
- All tasks reference specific requirements
- **Outcomes are fixed, steps are flexible** - if something takes too long, skip it and move forward
- Focus on core functionality first
- Testing is integrated into verification phase
- Documentation is created as you go
- Cleanup is automated for post-hackathon
- **If you get stuck on a task, move to the next one** - you can always come back

**Remember:** The goal is a working cloud deployment for demo day. Don't get blocked on any single step.
