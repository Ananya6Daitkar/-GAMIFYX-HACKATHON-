# Quick Start - Bulletproof Edition

## TL;DR: Deploy in 12 Minutes

```bash
# 1. Setup AWS (5 min)
# - Open Amplify console
# - Open Beanstalk console
# - Open RDS console
# - Open ElastiCache console

# 2. Deploy frontend (2 min)
# - Amplify: Connect GitHub → Deploy → Done

# 3. Deploy backend (3 min)
# - Beanstalk: Create environment → Add env vars → Deploy → Done

# 4. Create database (2 min)
# - Aurora: Create cluster → Copy URL

# 5. Create cache (2 min)
# - ElastiCache: Create cluster → Copy URL

# 6. Verify (3 min)
# - Test frontend URL
# - Test backend health check
# - Verify database connected
# - Verify cache connected

# 7. Demo (5-10 min)
# - Open frontend
# - Walk through features
# - Show judges AWS URLs

# 8. Cleanup (2 min)
# - Delete all resources (4 clicks)
```

## Step-by-Step

### Step 1: Setup AWS (5 min)

1. **Open AWS Amplify**
   - Go to console.aws.amazon.com
   - Search for "Amplify"
   - Click "Amplify"

2. **Open AWS Beanstalk**
   - Search for "Elastic Beanstalk"
   - Click "Elastic Beanstalk"

3. **Open AWS RDS**
   - Search for "RDS"
   - Click "RDS"

4. **Open AWS ElastiCache**
   - Search for "ElastiCache"
   - Click "ElastiCache"

### Step 2: Deploy Frontend (2 min)

1. Go to Amplify console
2. Click "New App"
3. Select "Host web app"
4. Select your GitHub repository
5. Set build command: `npm run build --workspace=frontend`
6. Set output directory: `frontend/dist`
7. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://[BEANSTALK_URL]` (you'll get this in step 3)
8. Click "Deploy"
9. Wait for deployment (2 min)
10. Copy frontend URL

### Step 3: Deploy Backend (3 min)

1. Go to Beanstalk console
2. Click "Create environment"
3. Select "Web server environment"
4. Select "Docker" platform
5. Select your GitHub repository
6. Add environment variables:
   - `DATABASE_URL=postgresql://[AURORA_URL]` (you'll get this in step 4)
   - `REDIS_URL=redis://[ELASTICACHE_URL]` (you'll get this in step 5)
   - `NODE_ENV=production`
   - `PORT=5000`
7. Click "Create environment"
8. Wait for deployment (3 min)
9. Copy backend URL

### Step 4: Create Database (2 min)

1. Go to RDS console
2. Click "Create database"
3. Select "Aurora (PostgreSQL compatible)"
4. Select "Serverless"
5. Create database
6. Copy connection string
7. Paste into Beanstalk environment variables (step 3)

### Step 5: Create Cache (2 min)

1. Go to ElastiCache console
2. Click "Create cluster"
3. Select "Redis"
4. Select "cache.t3.micro"
5. Create cluster
6. Copy connection string
7. Paste into Beanstalk environment variables (step 3)

### Step 6: Verify (3 min)

```bash
# Test frontend
open https://[AMPLIFY_URL]
# Should load instantly

# Test backend
curl https://[BEANSTALK_URL]/api/health
# Should return HTTP 200

# Check database
# Go to RDS dashboard → Verify connection active

# Check cache
# Go to ElastiCache dashboard → Verify connection active
```

### Step 7: Demo (5-10 min)

1. Read DEMO_SCRIPT.md
2. Open frontend URL
3. Walk through features
4. Show judges the AWS URLs
5. Verify no errors

### Step 8: Cleanup (2 min)

```bash
# Delete Amplify app (1 click)
# Delete Beanstalk environment (1 click)
# Delete Aurora cluster (1 click)
# Delete ElastiCache cluster (1 click)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend not loading | Redeploy in Amplify console |
| Backend not responding | Redeploy in Beanstalk console |
| Database connection failed | Check RDS dashboard, usually recovers in 30 sec |
| Cache connection failed | Check ElastiCache dashboard, usually recovers in 30 sec |
| Build fails | Fix build locally, push to GitHub, redeploy |
| Environment variables missing | Add them in service console |

## Cost Check

- Amplify: $0 (free tier)
- Beanstalk: $0 (750 hours free)
- Aurora Serverless: $0 (750 hours free)
- ElastiCache: $0 (750 hours free)
- **Total: $0**

## Success Criteria

✅ Frontend loads in < 2 seconds
✅ Backend responds in < 1 second
✅ Database is connected
✅ Cache is connected
✅ Demo runs smoothly
✅ All resources deleted after demo

## Next Steps

1. Open `.kiro/specs/aws-deployment-bulletproof/tasks.md`
2. Follow each task sequentially
3. Run demo script
4. Delete all resources

**Total time: 12 minutes**

</content>
