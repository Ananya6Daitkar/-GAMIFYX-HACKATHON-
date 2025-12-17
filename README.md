# GamifyX Platform

AI-Powered Gamified Learning Platform with real-time feedback, leaderboards, and focus mode.

## Project Structure

```
gamifyx-platform/
├── frontend/          # React + TypeScript + Tailwind CSS
├── backend/           # Express + PostgreSQL + Redis
└── .kiro/            # Spec documents
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Ollama (for AI feedback)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database and Redis credentials
npm run dev
```

Backend runs on `http://localhost:5000`

### Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres -d gamifyx -f backend/src/database/schema.sql
```

## Testing

### Run all tests
```bash
npm run test:run
```

### Run tests in watch mode
```bash
npm run test
```

## Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Framer Motion, Recharts, Socket.io
- **Backend**: Express, PostgreSQL, Redis, Socket.io, JWT
- **Testing**: Vitest, Fast-Check (property-based testing)
- **AI**: Ollama (Mistral 7B)
