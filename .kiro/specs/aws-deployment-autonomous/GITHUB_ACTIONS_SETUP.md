# GitHub Actions CI/CD Setup

## Overview

GitHub Actions automates the deployment process. Every push to `main` branch automatically:
1. Builds Docker image
2. Pushes to ECR
3. Updates ECS service
4. Deploys frontend to S3
5. Invalidates CloudFront cache
6. Verifies deployment
7. Sends Slack notification

---

## Setup Steps

### Step 1: Create GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add these secrets:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
CLOUDFRONT_DISTRIBUTION_ID
CLOUDFRONT_DOMAIN
ALB_DNS
SLACK_WEBHOOK (optional)
```

### Step 2: Create IAM User for GitHub Actions

```bash
# Create user
aws iam create-user --user-name github-actions

# Create access key
aws iam create-access-key --user-name github-actions

# Attach policy
aws iam attach-user-policy \
  --user-name github-actions \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

**Save the Access Key ID and Secret Access Key** → Add to GitHub Secrets

### Step 3: Create task-definition.json

```bash
# Get current task definition
aws ecs describe-task-definition \
  --task-definition gamifyx-backend \
  --query 'taskDefinition' > task-definition.json

# Commit to repo
git add task-definition.json
git commit -m "Add task definition for GitHub Actions"
git push
```

### Step 4: Add Slack Webhook (Optional)

1. Go to Slack workspace settings
2. Create incoming webhook
3. Add webhook URL to GitHub Secrets as `SLACK_WEBHOOK`

---

## Workflow File

The workflow is defined in `.github/workflows/deploy.yml`

### What It Does

```yaml
on:
  push:
    branches: [ main ]  # Trigger on push to main
  workflow_dispatch:    # Manual trigger
```

### Steps

1. **Checkout code** - Get latest code
2. **Configure AWS credentials** - Use GitHub Secrets
3. **Login to ECR** - Authenticate with Docker registry
4. **Build & push image** - Build Docker image, push to ECR
5. **Update task definition** - Update with new image
6. **Deploy to ECS** - Update ECS service
7. **Deploy frontend** - Upload to S3, invalidate CloudFront
8. **Verify deployment** - Test health endpoints
9. **Slack notification** - Send status to Slack

---

## Usage

### Automatic Deployment

```bash
# Push to main branch
git push origin main

# GitHub Actions automatically:
# 1. Builds Docker image
# 2. Pushes to ECR
# 3. Updates ECS service
# 4. Deploys frontend
# 5. Verifies deployment
# 6. Sends Slack notification
```

### Manual Deployment

Go to: **Actions → Deploy to AWS → Run workflow**

---

## Monitoring Deployment

### View Workflow Status

1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. See real-time logs

### Check Deployment

```bash
# Verify backend is updated
curl http://[ALB_DNS]/api/health

# Verify frontend is updated
curl https://[CLOUDFRONT_DOMAIN]

# Check ECS service
aws ecs describe-services \
  --cluster gamifyx-cluster \
  --services gamifyx-backend
```

---

## Troubleshooting

### Workflow Fails: "AWS credentials not found"

**Solution:** Add AWS secrets to GitHub
- Go to Settings → Secrets and variables → Actions
- Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Workflow Fails: "ECR login failed"

**Solution:** Verify IAM user has ECR permissions
```bash
aws iam attach-user-policy \
  --user-name github-actions \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
```

### Workflow Fails: "ECS service not found"

**Solution:** Verify ECS cluster and service exist
```bash
aws ecs list-services --cluster gamifyx-cluster
```

### Workflow Fails: "S3 bucket not found"

**Solution:** Verify S3 bucket name in secrets
```bash
aws s3 ls | grep gamifyx
```

---

## Environment Variables

The workflow uses these environment variables:

```yaml
AWS_REGION: us-east-1
ECR_REPOSITORY: gamifyx-backend
ECS_SERVICE: gamifyx-backend
ECS_CLUSTER: gamifyx-cluster
ECS_TASK_DEFINITION: gamifyx-backend
```

Modify in `.github/workflows/deploy.yml` if needed.

---

## Secrets Reference

| Secret | Value | Example |
|--------|-------|---------|
| AWS_ACCESS_KEY_ID | From IAM user | AKIA... |
| AWS_SECRET_ACCESS_KEY | From IAM user | wJal... |
| S3_BUCKET_NAME | S3 bucket name | gamifyx-frontend-1234567890 |
| CLOUDFRONT_DISTRIBUTION_ID | CloudFront ID | E1234ABCD |
| CLOUDFRONT_DOMAIN | CloudFront domain | d123.cloudfront.net |
| ALB_DNS | ALB DNS name | gamifyx-alb-123.us-east-1.elb.amazonaws.com |
| SLACK_WEBHOOK | Slack webhook URL | https://hooks.slack.com/... |

---

## Advanced: Custom Triggers

### Deploy on Pull Request

```yaml
on:
  pull_request:
    branches: [ main ]
```

### Deploy on Schedule

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

### Deploy on Release

```yaml
on:
  release:
    types: [published]
```

---

## Best Practices

1. **Use branch protection** - Require PR reviews before merge
2. **Use environments** - Separate staging and production
3. **Use secrets** - Never hardcode credentials
4. **Monitor logs** - Check workflow logs for errors
5. **Test locally** - Test deployment script locally first
6. **Use tags** - Tag releases for easy rollback

---

## Rollback

If deployment fails, rollback to previous version:

```bash
# Get previous task definition revision
aws ecs describe-task-definition \
  --task-definition gamifyx-backend:1

# Update service to use previous revision
aws ecs update-service \
  --cluster gamifyx-cluster \
  --service gamifyx-backend \
  --task-definition gamifyx-backend:1
```

---

## Cost Optimization

GitHub Actions is free for public repos and includes:
- 2,000 minutes/month for free accounts
- Unlimited for public repos
- No additional cost for AWS deployments

---

## Next Steps

1. Create GitHub Secrets
2. Create IAM user for GitHub Actions
3. Generate task-definition.json
4. Push to main branch
5. Watch workflow run in Actions tab
6. Verify deployment

---

## Support

For issues:
1. Check workflow logs in Actions tab
2. Check AWS CloudWatch logs
3. Check ECS task logs
4. Verify GitHub Secrets are set correctly

---

**GitHub Actions is now automating your deployments! 🚀**
