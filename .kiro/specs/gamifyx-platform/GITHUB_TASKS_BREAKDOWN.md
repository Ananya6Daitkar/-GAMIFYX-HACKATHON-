# GitHub Assignment System - Detailed Task Breakdown

## Task 9.2: GitHub OAuth & Assignment Management Backend
**Estimated Time:** 45 minutes
**Complexity:** Medium
**Dependencies:** Task 2 (Database setup)

### Subtasks

#### 9.2.1 Set up GitHub OAuth Flow
- [ ] Register GitHub OAuth application (free)
- [ ] Implement OAuth callback handler in Express
- [ ] Store: githubUserId, githubUsername, accessToken
- [ ] Create user linking endpoint
- [ ] Handle token refresh logic
- [ ] Add role field to users table (STUDENT/TEACHER)

**Files to create/modify:**
- `backend/src/routes/auth.ts` - OAuth endpoints
- `backend/src/middleware/github-oauth.ts` - OAuth middleware
- `backend/src/database/models.ts` - Add github fields to User

#### 9.2.2 Create Assignment Database Schema
- [ ] Create `assignments` table with fields:
  - id, teacher_id, title, description, difficulty, xpReward, maxScore
  - requiredFiles (array), expectedFolderStructure, branch, deadline
  - created_at, updated_at
- [ ] Create `assignment_submissions` table with fields:
  - id, student_id, assignment_id, github_repo_url, branch
  - status (IN_PROGRESS/SUBMITTED/PASS/REVIEW/FAIL)
  - score, auto_grade_breakdown (JSONB), ai_feedback_id, xp_earned
  - created_at, updated_at
- [ ] Create indexes on: teacher_id, student_id, assignment_id, status
- [ ] Add foreign key constraints

**Files to create/modify:**
- `backend/src/database/schema.sql` - Add new tables
- `backend/src/database/models.ts` - Add TypeScript interfaces

#### 9.2.3 Implement Assignment CRUD Endpoints (Teacher Only)
- [ ] POST `/api/assignments` - Create assignment (teacher only)
  - Validate: title, description, difficulty, xpReward
  - Validate: requiredFiles array, expectedFolderStructure
  - Return: created assignment with id
- [ ] GET `/api/assignments` - List all assignments
  - Filter by: difficulty, status, deadline
  - Return: paginated list
- [ ] GET `/api/assignments/:id` - Get assignment details
- [ ] PUT `/api/assignments/:id` - Update assignment (teacher only)
- [ ] DELETE `/api/assignments/:id` - Delete assignment (teacher only)
- [ ] Add role-based access control middleware

**Files to create/modify:**
- `backend/src/routes/assignments.ts` - Assignment endpoints
- `backend/src/middleware/auth.ts` - Add role checking

#### 9.2.4 Implement Student Assignment Acceptance
- [ ] POST `/api/assignments/:id/accept` - Accept assignment
  - Input: github_repo_url, branch (optional, default: main)
  - Validate: GitHub repo URL format
  - Create assignment_submission record
  - Status: IN_PROGRESS
  - Return: submission id
- [ ] GET `/api/students/assignments` - List accepted assignments
  - Show: assignment details + submission status
  - Filter by: status (IN_PROGRESS, SUBMITTED, etc.)
- [ ] GET `/api/students/submissions` - List all submissions
  - Show: assignment, status, score, feedback

**Files to create/modify:**
- `backend/src/routes/submissions.ts` - Submission endpoints
- `backend/src/services/assignmentService.ts` - Business logic

---

## Task 9.3: GitHub Webhook Handler & Auto-Grading Engine
**Estimated Time:** 45 minutes
**Complexity:** High
**Dependencies:** Task 9.2 (Backend setup)

### Subtasks

#### 9.3.1 Set up GitHub Webhook Listener
- [ ] Create webhook endpoint: POST `/api/webhooks/github`
- [ ] Verify webhook signature (GitHub secret)
- [ ] Parse webhook payload:
  - Extract: repository, commits, pusher, ref (branch)
  - Get: commit SHA, author, timestamp, changed files
  - Fetch: full diff using GitHub API (free)
- [ ] Match repository URL to assignment_submission
- [ ] Match author (GitHub username) to student
- [ ] Handle errors gracefully (invalid repo, unknown student)

**Files to create/modify:**
- `backend/src/routes/webhooks.ts` - Webhook endpoint
- `backend/src/services/webhookService.ts` - Webhook parsing
- `backend/src/utils/github.ts` - GitHub API helpers

#### 9.3.2 Implement Static Code Analysis
- [ ] Analyze commit message quality (10 points)
  - Check: length > 10 chars, descriptive, no "WIP"
  - Score: 0-10 based on quality
- [ ] Count commits (10 points)
  - Score: min(10, commitCount)
- [ ] Analyze lines added/removed (15 points)
  - Check: balance between additions and deletions
  - Penalize: too many deletions or additions
  - Score: 0-15 based on balance
- [ ] Check required files (20 points)
  - Verify: all files in assignment.requiredFiles exist
  - Score: 20 if all present, 0 otherwise
- [ ] Verify folder structure (25 points)
  - Check: expected_folder_structure matches
  - Score: 0-25 based on compliance
- [ ] Analyze README quality (20 points)
  - Check: README.md exists, length > 100 chars
  - Check: contains sections (Description, Usage, etc.)
  - Score: 0-20 based on quality

**Files to create/modify:**
- `backend/src/services/gradingService.ts` - Grading logic
- `backend/src/utils/codeAnalysis.ts` - Code analysis helpers

#### 9.3.3 Calculate Score and Assign Status
- [ ] Sum all criteria scores (0-100)
- [ ] Assign status:
  - PASS: score ≥ 80
  - REVIEW: 50 ≤ score < 80
  - FAIL: score < 50
- [ ] Store score breakdown as JSONB:
  ```json
  {
    "commitMessageQuality": 8,
    "numberOfCommits": 10,
    "linesBalance": 12,
    "requiredFiles": 20,
    "folderStructure": 25,
    "readmeQuality": 18,
    "total": 93,
    "status": "PASS"
  }
  ```
- [ ] Update assignment_submission record

**Files to create/modify:**
- `backend/src/services/gradingService.ts` - Status assignment

#### 9.3.4 Implement XP Reward Calculation
- [ ] Calculate base XP from assignment.xpReward
- [ ] Apply status multiplier:
  - PASS: 1.0x (full XP)
  - REVIEW: 0.5x (half XP)
  - FAIL: 0.0x (no XP)
- [ ] Apply difficulty multiplier:
  - EASY: 1.0x
  - MEDIUM: 1.0x
  - HARD: 1.2x
- [ ] Formula: `xp_earned = base_xp × status_multiplier × difficulty_multiplier`
- [ ] Award XP to student:
  - Add to user.totalXp
  - Trigger level recalculation
  - Update leaderboard (Redis)
- [ ] Broadcast XP event via WebSocket

**Files to create/modify:**
- `backend/src/services/gamificationService.ts` - XP calculation
- `backend/src/services/leaderboardService.ts` - Leaderboard update

---

## Task 9.4: Local LLM Feedback Pipeline (Ollama Integration)
**Estimated Time:** 30 minutes
**Complexity:** Medium
**Dependencies:** Task 9.3 (Grading complete), Ollama running locally

### Subtasks

#### 9.4.1 Set up Ollama Connection
- [ ] Verify Ollama is running locally (default: http://localhost:11434)
- [ ] Create Ollama client service
- [ ] Test connection with simple prompt
- [ ] Handle connection errors gracefully
- [ ] Support model selection (Mistral 7B, Llama 2)
- [ ] Add timeout handling (max 10 seconds)

**Files to create/modify:**
- `backend/src/services/ollamaService.ts` - Ollama client
- `backend/src/config/ollama.ts` - Configuration

#### 9.4.2 Create Feedback Generation Service
- [ ] Build prompt with:
  - Git diff from submission
  - Score breakdown (from auto-grader)
  - Assignment description and requirements
  - Student's current skill level (optional)
- [ ] Send prompt to Ollama
- [ ] Parse LLM response to extract:
  - Strengths (bullet points)
  - Issues/Problems (bullet points)
  - Improvement suggestions (bullet points)
- [ ] Generate confidence score (0-100):
  - Based on response length, coherence, relevance
  - Lower confidence if timeout occurred
- [ ] Handle timeouts (>10s):
  - Return partial feedback with low confidence
  - Log timeout for monitoring

**Files to create/modify:**
- `backend/src/services/feedbackService.ts` - Feedback generation
- `backend/src/utils/promptBuilder.ts` - Prompt construction

#### 9.4.3 Store AI Feedback in Database
- [ ] Create feedback record in ai_feedback table:
  - submission_id, insights (array), confidence_score
  - generated_at timestamp
- [ ] Link feedback to assignment_submission
- [ ] Handle duplicate feedback (don't regenerate)
- [ ] Add indexing for fast retrieval

**Files to create/modify:**
- `backend/src/database/schema.sql` - Ensure ai_feedback table exists
- `backend/src/services/feedbackService.ts` - Storage logic

#### 9.4.4 Integrate with Submission Pipeline
- [ ] After grading completes:
  - Trigger feedback generation asynchronously
  - Don't block submission response
  - Use job queue or background task
- [ ] Notify student when feedback is ready
- [ ] Display feedback in submission detail view

**Files to create/modify:**
- `backend/src/services/webhookService.ts` - Add feedback trigger
- `backend/src/services/feedbackService.ts` - Async handling

---

## Task 9.5: Assignment & Submission UI Components
**Estimated Time:** 30 minutes
**Complexity:** Medium
**Dependencies:** Task 9.2, 9.3, 9.4 (Backend complete)

### Subtasks

#### 9.5.1 Create Student Assignment Components
- [ ] AssignmentList component
  - Fetch: GET `/api/assignments`
  - Display: list of available assignments
  - Filter by: difficulty, deadline
  - Show: title, description, difficulty badge, XP reward
- [ ] AssignmentCard component
  - Show: assignment details
  - Display: difficulty badge (color-coded)
  - Show: XP reward, deadline
  - Button: "Accept Quest"
- [ ] AcceptAssignmentModal component
  - Input: GitHub repository URL
  - Input: Branch (default: main)
  - Validation: GitHub URL format
  - Submit: POST `/api/assignments/:id/accept`
  - Show: confirmation with submission ID

**Files to create/modify:**
- `frontend/src/components/Assignments/AssignmentList.tsx`
- `frontend/src/components/Assignments/AssignmentCard.tsx`
- `frontend/src/components/Assignments/AcceptAssignmentModal.tsx`
- `frontend/src/components/Assignments/index.ts`

#### 9.5.2 Create Submission History Components
- [ ] SubmissionHistory component
  - Fetch: GET `/api/students/submissions`
  - Display: list of all submissions
  - Show: assignment name, status, score, date
  - Filter by: status (PASS/REVIEW/FAIL)
  - Sort by: date (newest first)
- [ ] SubmissionCard component
  - Show: commit SHA (truncated), timestamp
  - Display: status badge (green/yellow/red)
  - Show: score (0-100)
  - Button: "View Details"
- [ ] SubmissionDetailCard component
  - Show: full submission details
  - Display: auto-grading breakdown (JSON)
  - Show: AI feedback card
  - Display: XP earned
  - Show: commit diff (if available)

**Files to create/modify:**
- `frontend/src/components/Submissions/SubmissionHistory.tsx`
- `frontend/src/components/Submissions/SubmissionCard.tsx`
- `frontend/src/components/Submissions/SubmissionDetailCard.tsx`

#### 9.5.3 Create Teacher Assignment Manager
- [ ] TeacherAssignmentManager component
  - Show: list of created assignments
  - Button: "Create New Assignment"
  - Show: assignment details, student count
  - Button: "Edit" / "Delete"
- [ ] CreateAssignmentForm component
  - Input: title, description
  - Select: difficulty (EASY/MEDIUM/HARD)
  - Input: XP reward
  - Input: required files (comma-separated)
  - Input: expected folder structure
  - Input: deadline (optional)
  - Submit: POST `/api/assignments`
- [ ] StudentSubmissionsList component
  - Show: all student submissions for assignment
  - Display: student name, status, score
  - Button: "View Details"
  - Show: AI feedback

**Files to create/modify:**
- `frontend/src/components/Teacher/TeacherAssignmentManager.tsx`
- `frontend/src/components/Teacher/CreateAssignmentForm.tsx`
- `frontend/src/components/Teacher/StudentSubmissionsList.tsx`

#### 9.5.4 Apply Cyberpunk Theme & Styling
- [ ] Status badges:
  - PASS: green with neon glow
  - REVIEW: yellow with neon glow
  - FAIL: red with neon glow
- [ ] Difficulty badges:
  - EASY: blue
  - MEDIUM: yellow
  - HARD: red with 1.2x multiplier indicator
- [ ] Cards: glass morphism effect
  - Semi-transparent background
  - Backdrop blur (10px)
  - Border: neon glow
- [ ] Animations:
  - Smooth entrance (fade + slide)
  - Hover effects (scale + glow)
  - Status transitions (smooth color change)
- [ ] Responsive design:
  - Mobile: single column
  - Tablet: two columns
  - Desktop: three columns

**Files to create/modify:**
- `frontend/src/components/Assignments/Assignments.css`
- `frontend/src/components/Teacher/Teacher.css`
- `frontend/src/constants/theme.ts` - Add assignment colors

---

## Testing Strategy

### Unit Tests (Optional, marked with *)
- [ ] Test auto-grading scoring logic
- [ ] Test XP calculation with multipliers
- [ ] Test GitHub webhook parsing
- [ ] Test LLM feedback parsing
- [ ] Test component rendering

### Integration Tests
- [ ] Test full submission flow (accept → push → grade → feedback)
- [ ] Test XP award and leaderboard update
- [ ] Test real-time notification delivery

### Manual Testing
- [ ] Create assignment as teacher
- [ ] Accept assignment as student
- [ ] Push code to GitHub
- [ ] Verify webhook triggers
- [ ] Check auto-grading score
- [ ] Verify LLM feedback generates
- [ ] Check XP awarded
- [ ] Verify leaderboard updated

---

## Deployment Checklist

- [ ] GitHub OAuth app registered
- [ ] GitHub webhook configured
- [ ] Ollama running locally
- [ ] PostgreSQL database initialized
- [ ] Redis cache running
- [ ] Environment variables set:
  - GITHUB_CLIENT_ID
  - GITHUB_CLIENT_SECRET
  - GITHUB_WEBHOOK_SECRET
  - OLLAMA_URL
  - DATABASE_URL
  - REDIS_URL
- [ ] All tests passing
- [ ] Demo script prepared

---

## Success Criteria

✅ GitHub OAuth login working
✅ Teachers can create assignments
✅ Students can accept assignments
✅ GitHub webhooks receiving push events
✅ Auto-grading scoring correctly (0-100)
✅ Submission status assigned (PASS/REVIEW/FAIL)
✅ LLM feedback generating with confidence scores
✅ XP awarded with difficulty multipliers
✅ Leaderboard updated in real-time
✅ UI displaying all results
✅ All tests passing
✅ Demo-ready in < 5 minutes
✅ 100% FREE (no paid services)
