# GamifyX Platform - Local Setup Guide

## Prerequisites

You need to have the following installed:
- Node.js (v18+)
- PostgreSQL (v12+)
- Redis
- Ollama (optional, for AI feedback)

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Set Up PostgreSQL

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database and user
createuser gamifyx_user -P  # Enter password when prompted
createdb -O gamifyx_user gamifyx
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createuser gamifyx_user -P
sudo -u postgres createdb -O gamifyx_user gamifyx
```

### Windows
- Download and install PostgreSQL from https://www.postgresql.org/download/windows/
- During installation, set password for postgres user
- Create database:
```bash
psql -U postgres
CREATE USER gamifyx_user WITH PASSWORD 'your_password';
CREATE DATABASE gamifyx OWNER gamifyx_user;
```

## Step 3: Set Up Redis

### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Windows
- Download from https://github.com/microsoftarchive/redis/releases
- Or use Windows Subsystem for Linux (WSL)

## Step 4: Configure Environment Variables

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (update password if different)
DATABASE_URL=postgresql://gamifyx_user:your_password@localhost:5432/gamifyx

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# Ollama (optional)
OLLAMA_URL=http://localhost:11434

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

## Step 5: Initialize Database Schema

```bash
cd backend
psql -U gamifyx_user -d gamifyx -f src/database/schema.sql
```

## Step 6: Start the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
# Server will start on http://localhost:3000
```

## Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Optional: Set Up Ollama for AI Feedback

If you want to use the AI feedback feature:

```bash
# Install Ollama from https://ollama.ai

# Pull a model (Mistral 7B recommended)
ollama pull mistral

# Start Ollama server
ollama serve
# Server will run on http://localhost:11434
```

## Troubleshooting

### PostgreSQL Connection Error
- Verify PostgreSQL is running: `psql -U gamifyx_user -d gamifyx`
- Check DATABASE_URL in .env file
- Ensure password is correct

### Redis Connection Error
- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_URL in .env file

### Port Already in Use
- Backend (5000): `lsof -i :5000` and kill the process
- Frontend (3000): `lsof -i :3000` and kill the process

### Module Not Found Errors
- Delete node_modules and package-lock.json
- Run `npm install` again

## Running Tests

```bash
# Backend tests
cd backend
npm test -- --run

# Frontend tests
cd frontend
npm test -- --run
```

## Production Deployment

For production deployment, see the deployment guides in the `.kiro/specs/gamifyx-platform/` directory.

---

**Happy coding! 🚀**
