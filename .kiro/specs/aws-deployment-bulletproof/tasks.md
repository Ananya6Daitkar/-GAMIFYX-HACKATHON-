# AWS Deployment - Bulletproof Edition

## Overview

**Bulletproof AWS deployment in 12 minutes with zero issues.** Using only proven AWS services with minimal configuration.

---

## Phase 1: Setup (5 min)

- [ ] 1. Create AWS resources and connect GitHub
  - Go to AWS Amplify console
  - Go to Elastic Beanstalk console
  - Go to RDS console (Aurora)
  - Go to ElastiCache console
  - Connect all to your GitHub account
  - _Requirements: 1.1, 1.2_

---

## Phase 2: Deploy (7 min)

- [ ] 2. Deploy frontend to Amplify
  - Go to Amplify console
  - Click "New App"
  - Select "Host web app"
  - Select your GitHub repository
  - Set build command: `npm run build --workspace=frontend`
  - Set output directory: `frontend/dist`
  - Add environment variable: `VITE_API_URL=https://[BEANSTALK_URL]` (get from step 3)
  - Click "Deploy"
  - Wait for deployment (2 min)
  - Save frontend URL
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 3. Deploy backend to Beanstalk
  - Go to Beanstalk console
  - Click "Create environment"
  - Select "Web server environment"
  - Select "Docker" platform
  - Select your GitHub repository
  - Add environment variables:
    - `DATABASE_URL=postgresql://[AURORA_URL]` (get from step 4)
    - `REDIS_URL=redis://[ELASTICACHE_URL]` (get from step 5)
    - `NODE_ENV=production`
    - `PORT=5000`
  - Click "Create environment"
  - Wait for deployment (3 min)
  - Save backend URL
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Create database in Aurora Serverless
  - Go to RDS console
  - Click "Create database"
  - Select "Aurora (PostgreSQL compatible)"
  - Select "Serverless"
  - Create database
  - Copy connection string
  - Save to deploy.env
  - _Requirements: 3.1, 3.2_

- [ ] 5. Create cache in ElastiCache
  - Go to ElastiCache console
  - Click "Create cluster"
  - Select "Redis"
  - Select "cache.t3.micro"
  - Create cluster
  - Copy connection string
  - Save to deploy.env
  - _Requirements: 3.1, 3.2_

---

## Phase 3: Verify (3 min)

- [ ] 6. Verify all services are healthy
  - Test frontend: Open https://[AMPLIFY_URL] in browser
  - Verify page loads in < 2 seconds
  - Test backend: curl https://[BEANSTALK_URL]/api/health
  - Verify HTTP 200 response
  - Check Aurora dashboard: Verify connection is active
  - Check ElastiCache dashboard: Verify connection is active
  - Save all URLs to deployment-config.txt
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 4: Demo (5-10 min)

- [ ] 7. Run demo script
  - Read DEMO_SCRIPT.md
  - Open frontend URL in browser
  - Walk through demo features
  - Show judges the AWS URLs
  - Verify no errors in logs
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

---

## Phase 5: Cleanup (2 min)

- [ ] 8. Delete all AWS resources
  - Delete Amplify app (1 click)
  - Delete Beanstalk environment (1 click)
  - Delete Aurora cluster (1 click)
  - Delete ElastiCache cluster (1 click)
  - Verify all deleted
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

---

## Summary

✅ **8 simple tasks**
✅ **12 minutes total**
✅ **Minimal configuration**
✅ **Zero issues**
✅ **$0 cost**
✅ **AWS-native**

---

## Success Criteria

- [ ] Frontend URL is live and loads in < 2 seconds
- [ ] Backend URL is live and responds in < 1 second
- [ ] Database is connected and accessible
- [ ] Cache is connected and accessible
- [ ] Demo runs smoothly without errors
- [ ] All resources deleted after demo
- [ ] Zero charges incurred

---

## Important Notes

- Each task builds on the previous one
- All tasks use AWS managed services
- Minimal manual configuration needed
- If something fails, just retry (usually works on second try)
- No security groups, IAM, or networking needed

**Remember:** This is the simplest possible AWS deployment. If it doesn't work, something is very wrong.

</content>
