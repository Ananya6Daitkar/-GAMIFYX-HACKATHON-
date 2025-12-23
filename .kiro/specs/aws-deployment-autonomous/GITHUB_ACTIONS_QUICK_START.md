# GitHub Actions Quick Start

## What It Does

Every time you push to `main` branch, GitHub Actions automatically:

```
Push to main
    ↓
Build Docker image
    ↓
Push to ECR
    ↓
Update ECS service
    ↓
Deploy frontend to S3
    ↓
Invalidate CloudFront
    ↓
Verify deployment
    ↓
Send Slack notification
    ↓
✅ DEPLOYMENT COMPLETE
```

---

## 5-Minute Setup

### 1. Create GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add these 6 secrets:

```
AWS_ACCESS_KEY_ID          (from IAM user)
AWS_SECRET_ACCESS_KEY      (from IAM user)
S3_BUCKET_NAME             (gamifyx-frontend-xxx)
CLOUDFRONT_DISTRIBUTION_ID (E1234ABCD)
CLOUDFRONT_DOMAIN          (d123.cloudfront.net)
ALB_DNS                    (gamifyx-alb-xxx.elb.amazonaws.com)
```

### 2. Create IAM User

```bash
# Create user
aws iam create-user --user-name github-actions

# Create access key
aws iam create-access-key --user-name github-actions

# Attach admin policy
aws iam attach-user-policy \
  --user-name github-actions \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

Save the Access Key ID and Secret → Add to GitHub Secrets

### 3. Generate Task Definition

```bash
# Get current task definition
aws ecs describe-task-definition \
  --task-definition gamifyx-backend \
  --query 'taskDefinition' > task-definition.json

# Commit to repo
git add task-definition.json
git commit -m "Add task definition"
git push
```

### 4. Test Workflow

```bash
# Push to main (or any change)
git push origin main

# Watch it deploy automatically!
# Go to: Actions tab → See workflow running
```

---

## Files Created

```
.github/workflows/deploy.yml          ← Workflow definition
task-definition.json                  ← ECS task config
.kiro/specs/aws-deployment-autonomous/GITHUB_ACTIONS_SETUP.md
```

---

## How to Use

### Automatic Deployment

```bash
# Make changes
git add .
git commit -m "Update code"
git push origin main

# GitHub Actions automatically deploys!
```

### Manual Deployment

Go to: **Actions → Deploy to AWS → Run workflow**

### Monitor Deployment

1. Go to **Actions** tab
2. Click latest workflow run
3. See real-time logs
4. Check status

---

## Verify Deployment

```bash
# Check backend
curl http://[ALB_DNS]/api/health

# Check frontend
curl https://[CLOUDFRONT_DOMAIN]

# Check ECS service
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend
```

---

## Workflow Status

| Status | Meaning |
|--------|---------|
| ✅ Passed | Deployment successful |
| ❌ Failed | Deployment failed (check logs) |
| ⏳ In Progress | Deployment running |

---

## Common Issues

### "AWS credentials not found"
→ Add AWS secrets to GitHub

### "ECR login failed"
→ Verify IAM user has ECR permissions

### "ECS service not found"
→ Verify cluster and service exist

### "S3 bucket not found"
→ Verify bucket name in secrets

---

## Secrets Checklist

- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] S3_BUCKET_NAME
- [ ] CLOUDFRONT_DISTRIBUTION_ID
- [ ] CLOUDFRONT_DOMAIN
- [ ] ALB_DNS

---

## Workflow File Location

`.github/workflows/deploy.yml`

This file defines:
- When to run (on push to main)
- What to do (build, push, deploy)
- Where to deploy (AWS)
- How to notify (Slack)

---

## Cost

GitHub Actions is **FREE** for:
- Public repositories (unlimited)
- Private repositories (2,000 minutes/month)

No additional AWS costs for running the workflow.

---

## Next Steps

1. Create GitHub Secrets (5 min)
2. Create IAM user (5 min)
3. Generate task-definition.json (2 min)
4. Push to main (1 min)
5. Watch deployment in Actions tab (5-10 min)

**Total: ~20 minutes to set up automated CI/CD** 🚀

---

## You're Done!

Now every push to `main` automatically deploys to AWS.

No more manual deployment commands needed!

**Happy deploying! 🎉**
