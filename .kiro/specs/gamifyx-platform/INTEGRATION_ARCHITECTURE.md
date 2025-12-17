# GitHub Assignment System - Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GamifyX Platform                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Frontend (React)                          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  ┌─────────────────────┐  ┌──────────────────────────────┐  │   │
│  │  │  Student Dashboard  │  │  Teacher Dashboard           │  │   │
│  │  ├─────────────────────┤  ├──────────────────────────────┤  │   │
│  │  │ • Assignment List   │  │ • Create Assignment          │  │   │
│  │  │ • Accept Quest      │  │ • View Submissions           │  │   │
│  │  │ • Submission Hist.  │  │ • Review Scores              │  │   │
│  │  │ • Status Badge      │  │ • View AI Feedback           │  │   │
│  │  │ • AI Feedback       │  │ • Manual Override (bonus)    │  │   │
│  │  │ • XP Earned        │  │                              │  │   │
│  │  └─────────────────────┘  └──────────────────────────────┘  │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲                                       │
│                              │ HTTP/REST                             │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Express Backend API                         │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │  GitHub OAuth        │  │  Assignment Management       │ │   │
│  │  ├──────────────────────┤  ├──────────────────────────────┤ │   │
│  │  │ • Login flow         │  │ • Create assignment          │ │   │
│  │  │ • Token exchange     │  │ • Accept assignment          │ │   │
│  │  │ • User linking       │  │ • List assignments           │ │   │
│  │  │ • Profile sync       │  │ • Get submissions            │ │   │
│  │  └──────────────────────┘  └──────────────────────────────┘ │   │
│  │                                                              │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │  Webhook Handler     │  │  Auto-Grading Engine         │ │   │
│  │  ├──────────────────────┤  ├──────────────────────────────┤ │   │
│  │  │ • Receive push event │  │ • Parse commit data          │ │   │
│  │  │ • Verify signature   │  │ • Analyze code quality       │ │   │
│  │  │ • Extract commit SHA │  │ • Check required files       │ │   │
│  │  │ • Get diff           │  │ • Verify folder structure    │ │   │
│  │  │ • Trigger grading    │  │ • Calculate score (0-100)    │ │   │
│  │  └──────────────────────┘  └──────────────────────────────┘ │   │
│  │                                                              │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │  LLM Feedback Svc    │  │  Gamification Engine         │ │   │
│  │  ├──────────────────────┤  ├──────────────────────────────┤ │   │
│  │  │ • Connect to Ollama  │  │ • Calculate XP reward        │ │   │
│  │  │ • Send diff + score  │  │ • Apply difficulty mult.     │ │   │
│  │  │ • Parse response     │  │ • Update leaderboard         │ │   │
│  │  │ • Confidence score   │  │ • Award badges               │ │   │
│  │  │ • Store feedback     │  │ • Broadcast updates          │ │   │
│  │  └──────────────────────┘  └──────────────────────────────┘ │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲                                       │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  PostgreSQL     │  │  Redis Cache    │  │  Ollama LLM     │    │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤    │
│  │ • Users         │  │ • Leaderboard   │  │ • Mistral 7B    │    │
│  │ • Assignments   │  │ • Session cache │  │ • Llama 2       │    │
│  │ • Submissions   │  │ • Real-time     │  │ • Local only    │    │
│  │ • Scores        │  │   updates       │  │ • No API calls  │    │
│  │ • AI Feedback   │  │                 │  │                 │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ GitHub Webhooks
                              │ (Free)
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │  GitHub      │    │  GitHub      │
            │  OAuth       │    │  Webhooks    │
            │  (Free)      │    │  (Free)      │
            └──────────────┘    └──────────────┘
```

---

## Data Flow: Student Submission

```
1. STUDENT ACCEPTS ASSIGNMENT
   ┌─────────────────────────────────────────┐
   │ Student clicks "Accept Quest"           │
   │ Provides: GitHub repo URL, branch       │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ Backend creates assignment_submission   │
   │ Status: IN_PROGRESS                     │
   │ Stores: repo_url, branch, student_id    │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ Student pushes code to GitHub           │
   │ Commit SHA, author, diff captured       │
   └─────────────────────────────────────────┘

2. GITHUB WEBHOOK TRIGGERED
   ┌─────────────────────────────────────────┐
   │ GitHub sends push event to webhook      │
   │ Payload: commits, author, timestamp     │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ Backend verifies webhook signature      │
   │ Extracts: commit SHA, diff, files       │
   └─────────────────────────────────────────┘

3. AUTO-GRADING ENGINE
   ┌─────────────────────────────────────────┐
   │ Analyze code (static only):             │
   │ • Commit message quality: 10 pts        │
   │ • Number of commits: 10 pts             │
   │ • Lines added/removed: 15 pts           │
   │ • Required files: 20 pts                │
   │ • Folder structure: 25 pts              │
   │ • README quality: 20 pts                │
   │ Total Score: 0-100                      │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ Assign Status:                          │
   │ • PASS (≥80) → Full XP                  │
   │ • REVIEW (50-79) → 50% XP               │
   │ • FAIL (<50) → 0 XP                     │
   └─────────────────────────────────────────┘

4. LLM FEEDBACK GENERATION
   ┌─────────────────────────────────────────┐
   │ Send to Ollama (local):                 │
   │ • Git diff                              │
   │ • Score breakdown                       │
   │ • Assignment description                │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ LLM generates feedback:                 │
   │ • Strengths                             │
   │ • Issues                                │
   │ • Improvements                          │
   │ • Confidence score (0-100)              │
   └─────────────────────────────────────────┘

5. GAMIFICATION & REWARDS
   ┌─────────────────────────────────────────┐
   │ Calculate XP:                           │
   │ • Base: assignment.xpReward             │
   │ • Status multiplier: 1.0 / 0.5 / 0.0    │
   │ • Difficulty: HARD = 1.2x               │
   │ • Final XP = base × status × difficulty │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ Update user stats:                      │
   │ • Add XP to totalXp                     │
   │ • Recalculate level                     │
   │ • Update leaderboard (Redis)            │
   │ • Check badge unlock conditions         │
   └─────────────────────────────────────────┘

6. REAL-TIME NOTIFICATION
   ┌─────────────────────────────────────────┐
   │ Broadcast via WebSocket:                │
   │ • Submission graded                     │
   │ • Score and status                      │
   │ • XP earned                             │
   │ • Leaderboard updated                   │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │ Student sees in dashboard:              │
   │ • Submission status badge               │
   │ • Score breakdown                       │
   │ • AI feedback card                      │
   │ • XP earned                             │
   │ • Updated leaderboard rank              │
   └─────────────────────────────────────────┘
```

---

## Integration with Existing Features

### 1. Gamification System (Task 11)
```
GitHub Submission XP
        │
        ▼
   XP Event Handler
        │
        ├─→ Add to totalXp
        ├─→ Recalculate level
        ├─→ Update leaderboard
        └─→ Check badge conditions
```

### 2. Analytics Dashboard (Task 9)
```
GitHub Submissions
        │
        ├─→ Activity Chart (push events)
        ├─→ Skill Chart (languages used)
        └─→ Progress Chart (XP from assignments)
```

### 3. Real-time Updates (Task 17)
```
Submission Graded
        │
        ├─→ WebSocket broadcast
        ├─→ Leaderboard update
        └─→ Notification delivery
```

### 4. AI Feedback System (Task 8)
```
LLM Feedback
        │
        ├─→ Reuse Ollama connection
        ├─→ Display in submission card
        └─→ Show confidence score
```

---

## Database Schema Extensions

### assignments table
```sql
id (UUID) - Primary key
teacher_id (UUID) - Foreign key to users
title (VARCHAR) - Assignment name
description (TEXT) - Full description
difficulty (ENUM) - EASY, MEDIUM, HARD
xp_reward (INTEGER) - Base XP for completion
max_score (INTEGER) - Default 100
required_files (TEXT[]) - e.g., ['README.md', 'tests/']
expected_folder_structure (TEXT) - e.g., 'src/, tests/, docs/'
branch (VARCHAR) - Default 'main'
deadline (TIMESTAMP) - Optional deadline
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### assignment_submissions table
```sql
id (UUID) - Primary key
student_id (UUID) - Foreign key to users
assignment_id (UUID) - Foreign key to assignments
github_repo_url (VARCHAR) - Student's repo URL
branch (VARCHAR) - Branch submitted
status (ENUM) - IN_PROGRESS, SUBMITTED, PASS, REVIEW, FAIL
score (INTEGER) - 0-100 from auto-grader
auto_grade_breakdown (JSONB) - Detailed scoring
ai_feedback_id (UUID) - Foreign key to ai_feedback
xp_earned (INTEGER) - Final XP awarded
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### github_webhooks table
```sql
id (UUID) - Primary key
submission_id (UUID) - Foreign key to assignment_submissions
commit_sha (VARCHAR) - Git commit hash
author (VARCHAR) - GitHub username
timestamp (TIMESTAMP) - When pushed
changed_files (TEXT[]) - Files modified
diff (TEXT) - Full diff content
created_at (TIMESTAMP)
```

---

## FREE Constraint Verification

| Component | Solution | Cost |
|-----------|----------|------|
| Authentication | GitHub OAuth | FREE |
| Webhooks | GitHub Webhooks | FREE |
| APIs | GitHub REST API | FREE |
| Database | PostgreSQL (local) | FREE |
| Cache | Redis (local) | FREE |
| LLM | Ollama (local) | FREE |
| Frontend | React + TypeScript | FREE |
| Backend | Node.js + Express | FREE |
| **Total** | **All components** | **$0** |

---

## Implementation Timeline

| Task | Duration | Status |
|------|----------|--------|
| 9.2 - GitHub OAuth & Backend | 45 min | Not Started |
| 9.3 - Webhook & Auto-Grading | 45 min | Not Started |
| 9.4 - LLM Feedback Pipeline | 30 min | Not Started |
| 9.5 - UI Components | 30 min | Not Started |
| **Total** | **2.5 hours** | **Ready to Start** |

---

## Success Metrics

✅ GitHub OAuth login working
✅ Assignments created and accepted
✅ Webhooks receiving push events
✅ Auto-grading scoring correctly (0-100)
✅ Submission status assigned (PASS/REVIEW/FAIL)
✅ LLM feedback generating with confidence scores
✅ XP awarded with difficulty multipliers
✅ Leaderboard updated in real-time
✅ UI displaying all results
✅ All tests passing
✅ Demo-ready in < 5 minutes
✅ 100% FREE (no paid services)
