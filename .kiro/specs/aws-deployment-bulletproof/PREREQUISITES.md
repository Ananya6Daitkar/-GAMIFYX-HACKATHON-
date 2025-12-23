# Prerequisites & Credentials Guide - 12 Minute Deployment

## What You Need Before Starting

### 1. AWS Account (Required)

**Create AWS Account:**
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter email, password, account name
4. Add payment method (required, but won't charge for free tier)
5. Verify phone number
6. Choose support plan (free tier is fine)

**Verify Free Tier Access:**
```bash
# After account is created, sign in to AWS console
# Go to: https://console.aws.amazon.com
# Check: Billing → Free Tier → Verify you have free tier access
```

### 2. AWS Credentials (Required)

**Create IAM User for Deployment:**
1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Username: `gamifyx-deployment`
4. Click "Next"
5. Attach policies:
   - `AdministratorAccess` (for simplicity, can be restricted later)
6. Click "Create user"
7. Click on user → "Security credentials"
8. Click "Create access key"
9. Choose "Command Line Interface (CLI)"
10. Click "Create access key"
11. **Save these immediately:**
    - Access Key ID: `AKIA...`
    - Secret Access Key: `wJal...`

**Store Credentials Safely:**
```bash
# Create ~/.aws/credentials file
mkdir -p ~/.aws

# Add to ~/.aws/credentials:
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = wJal...

# Add to ~/.aws/config:
[default]
region = us-east-1
output = json
```

### 3. Local Tools (Required)

**Install AWS CLI:**
```bash
# macOS
brew install awscli

# Verify installation
aws --version
# Should show: aws-cli/2.x.x
```

**Install Docker:**
```bash
# macOS
brew install docker

# Or download Docker Desktop from https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
# Should show: Docker version 20.x.x
```

**Install Node.js:**
```bash
# macOS
brew install node

# Verify installation
node --version
# Should show: v18.x.x or higher
```

**Install Git:**
```bash
# macOS
brew install git

# Verify installation
git --version
# Should show: git version 2.x.x
```

### 4. GitHub Account (Required)

**Create GitHub Account:**
1. Go to https://github.com
2. Click "Sign up"
3. Enter email, password, username
4. Verify email
5. Complete setup

**Create GitHub Personal Access Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Name: `gamifyx-deployment`
4. Select scopes:
   - `repo` (full control of private repositories)
   - `admin:repo_hook` (write access to hooks)
5. Click "Generate token"
6. **Save token immediately:** `ghp_...`

### 5. Repository Setup (Required)

**Clone Repository:**
```bash
git clone https://github.com/[YOUR_USERNAME]/gamifyx.git
cd gamifyx
```

**Verify Local Build:**
```bash
# Build frontend
npm run build --workspace=frontend

# Build backend
npm run build --workspace=backend

# Create Docker image
docker build -t gamifyx-backend:latest backend/

# Verify image
docker images | grep gamifyx-backend
```

---

## Credentials Checklist

Before starting deployment, verify you have:

### AWS Credentials
- [ ] AWS Account created
- [ ] IAM user created (`gamifyx-deployment`)
- [ ] Access Key ID saved
- [ ] Secret Access Key saved
- [ ] AWS CLI installed and configured
- [ ] AWS credentials verified: `aws sts get-caller-identity`

### GitHub Credentials
- [ ] GitHub account created
- [ ] Personal access token created
- [ ] Token saved securely

### Local Tools
- [ ] AWS CLI installed: `aws --version`
- [ ] Docker installed: `docker --version`
- [ ] Node.js installed: `node --version`
- [ ] Git installed: `git --version`

### Repository
- [ ] Repository cloned locally
- [ ] Frontend builds: `npm run build --workspace=frontend`
- [ ] Backend builds: `npm run build --workspace=backend`
- [ ] Docker image builds: `docker build -t gamifyx-backend:latest backend/`

---

## Verify Setup

### Test AWS Credentials

```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Should output:
# {
#     "UserId": "AIDAI...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/gamifyx-deployment"
# }
```

### Test Docker

```bash
# Verify Docker is running
docker ps

# Should output:
# CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (empty list is fine)
```

### Test Node.js

```bash
# Verify Node.js is installed
node --version

# Should output: v18.x.x or higher
```

### Test Git

```bash
# Verify Git is installed
git --version

# Should output: git version 2.x.x
```

### Test Repository

```bash
# Verify repository is cloned
cd gamifyx
git status

# Should output: On branch main (or your branch)
```

---

## Environment Variables

### Create `.env` file for deployment

```bash
# Create file: .env
cat > .env << EOF
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Amplify Configuration
AMPLIFY_APP_NAME=gamifyx
AMPLIFY_BRANCH=main

# Beanstalk Configuration
BEANSTALK_APP_NAME=gamifyx
BEANSTALK_ENV_NAME=gamifyx-prod

# Database Configuration
DB_NAME=gamifyx
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!

# Cache Configuration
CACHE_NAME=gamifyx-cache

# GitHub Configuration
GITHUB_TOKEN=ghp_...
GITHUB_REPO=https://github.com/[USERNAME]/gamifyx.git

# Application Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://[AMPLIFY_URL]
BACKEND_URL=https://[BEANSTALK_URL]
EOF
```

---

## Security Best Practices

### Protect Your Credentials

**DO:**
- ✅ Store credentials in `~/.aws/credentials`
- ✅ Use IAM users instead of root account
- ✅ Rotate credentials regularly
- ✅ Use strong passwords
- ✅ Enable MFA on AWS account

**DON'T:**
- ❌ Commit credentials to GitHub
- ❌ Share credentials with others
- ❌ Use root account credentials
- ❌ Store credentials in `.env` files
- ❌ Hardcode credentials in code

### Secure Your Repository

```bash
# Add .env to .gitignore
echo ".env" >> .gitignore
echo "*.pem" >> .gitignore
echo "credentials" >> .gitignore

# Verify credentials are not in git
git status
```

---

## Troubleshooting

### AWS CLI Not Found

```bash
# Install AWS CLI
brew install awscli

# Or download from: https://aws.amazon.com/cli/
```

### Docker Not Running

```bash
# Start Docker Desktop (macOS)
open /Applications/Docker.app

# Or install from: https://www.docker.com/products/docker-desktop
```

### AWS Credentials Not Working

```bash
# Verify credentials file
cat ~/.aws/credentials

# Verify config file
cat ~/.aws/config

# Test credentials
aws sts get-caller-identity

# If error, reconfigure
aws configure
```

### Node.js Version Too Old

```bash
# Update Node.js
brew upgrade node

# Or download from: https://nodejs.org/
```

### Repository Clone Failed

```bash
# Verify GitHub token
echo $GITHUB_TOKEN

# Clone with token
git clone https://[TOKEN]@github.com/[USERNAME]/gamifyx.git

# Or use SSH
git clone git@github.com:[USERNAME]/gamifyx.git
```

---

## Quick Setup Script

```bash
#!/bin/bash

# Quick setup script for 12-minute deployment

echo "=== GamifyX 12-Minute Deployment Setup ==="

# Check AWS CLI
echo "Checking AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install with: brew install awscli"
    exit 1
fi
echo "✅ AWS CLI installed"

# Check Docker
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "✅ Docker installed"

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install with: brew install node"
    exit 1
fi
echo "✅ Node.js installed"

# Check Git
echo "Checking Git..."
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Install with: brew install git"
    exit 1
fi
echo "✅ Git installed"

# Verify AWS credentials
echo "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS credentials configured"

# Build frontend
echo "Building frontend..."
npm run build --workspace=frontend
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built"

# Build backend
echo "Building backend..."
npm run build --workspace=backend
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
echo "✅ Backend built"

# Build Docker image
echo "Building Docker image..."
docker build -t gamifyx-backend:latest backend/
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi
echo "✅ Docker image built"

echo ""
echo "=== Setup Complete ==="
echo "You're ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Open: .kiro/specs/aws-deployment-bulletproof/tasks.md"
echo "2. Follow each task sequentially"
echo "3. Run the deployment"
echo ""
```

---

## Next Steps

1. **Verify all prerequisites** are installed
2. **Create AWS account** and IAM user
3. **Configure AWS credentials** locally
4. **Create GitHub account** and personal access token
5. **Clone repository** and verify builds
6. **Run setup script** to verify everything
7. **Start deployment** (see tasks.md)

---

## Support

### If Something Goes Wrong

1. **AWS CLI issues**: https://docs.aws.amazon.com/cli/latest/userguide/
2. **Docker issues**: https://docs.docker.com/
3. **Node.js issues**: https://nodejs.org/
4. **Git issues**: https://git-scm.com/

### Quick Help

```bash
# Verify AWS CLI
aws --version

# Verify Docker
docker --version

# Verify Node.js
node --version

# Verify Git
git --version

# Test AWS credentials
aws sts get-caller-identity

# Test Docker
docker ps

# Test Node.js
node -e "console.log('Node.js works')"
```

---

## You're Ready!

Once you've completed all prerequisites, you're ready to start the 12-minute deployment.

**Next:** Open `.kiro/specs/aws-deployment-bulletproof/tasks.md` and follow the tasks.

</content>
