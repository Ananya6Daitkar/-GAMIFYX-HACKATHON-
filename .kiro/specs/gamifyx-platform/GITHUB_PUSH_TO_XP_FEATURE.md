# GitHub Push-to-XP Pipeline - Common Feature (Task 9.6)

## Overview

**"Students submit assignments by pushing to GitHub; every commit earns XP, unlocks badges, advances levels, updates leaderboards, and receives AI mentor feedback — all powered by free GitHub metadata."**

This is the **core gamification loop** that ties together all GitHub assignment features. It transforms every GitHub push into a complete gamification experience.

---

## Feature Flow

```
Student Pushes Code to GitHub
        ↓
GitHub Webhook Triggered
        ↓
┌─────────────────────────────────────────────────────────┐
│         GITHUB PUSH-TO-XP PIPELINE (Task 9.6)           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. EXTRACT GITHUB METADATA                            │
│     • Commit SHA, author, timestamp                    │
│     • Changed files, diff, commit message              │
│     • Lines added/removed                              │
│                                                         │
│  2. AWARD XP                                           │
│     • Base: +2 XP per commit                           │
│     • Bonus: +10 XP if PASS status                     │
│     • Multiplier: ×1.2 if HARD difficulty             │
│     • Total: base × status × difficulty               │
│                                                         │
│  3. CHECK BADGE CRITERIA                              │
│     • "First Commit" - unlock on first push           │
│     • "Commit Streak" - 5+ commits in 7 days          │
│     • "Code Master" - PASS status achieved            │
│     • "Feedback Listener" - implemented suggestions   │
│                                                         │
│  4. ADVANCE LEVEL                                      │
│     • Recalculate: level = floor(totalXP / 100)       │
│     • Trigger level-up animation if advanced          │
│     • Award level-up bonus XP (+50)                   │
│                                                         │
│  5. UPDATE LEADERBOARD                                │
│     • Update Redis cache with new XP                  │
│     • Recalculate rankings                            │
│     • Broadcast to all connected clients              │
│                                                         │
│  6. GENERATE AI FEEDBACK                              │
│     • Send to Ollama (local LLM)                      │
│     • Analyze: diff, quality, requirements            │
│     • Generate: strengths, issues, suggestions        │
│     • Confidence score (0-100)                        │
│                                                         │
│  7. SEND NOTIFICATIONS                                │
│     • XP earned: "+2 XP"                              │
│     • Badge unlocked: "🏆 First Commit"               │
│     • Level up: "⭐ Level 2"                          │
│     • Feedback ready: "💡 AI Mentor feedback"         │
│                                                         │
└─────────────────────────────────────────────────────────┘
        ↓
Student Sees in Dashboard:
  • XP earned (+2)
  • New badge (if unlocked)
  • Level advanced (if applicable)
  • Leaderboard rank updated
  • AI feedback card
  • Celebration animation
```

---

## XP Reward System

### Base XP Calculation

```
XP Earned = Base XP × Status Multiplier × Difficulty Multiplier

Where:
  Base XP = 2 (per commit)
  
  Status Multiplier:
    • PASS (≥80): 1.0x (full reward)
    • REVIEW (50-79): 0.5x (half reward)
    • FAIL (<50): 0.0x (no reward)
  
  Difficulty Multiplier:
    • EASY: 1.0x
    • MEDIUM: 1.0x
    • HARD: 1.2x
```

### Examples

| Scenario | Base | Status | Difficulty | Total XP |
|----------|------|--------|------------|----------|
| Easy commit, PASS | 2 | 1.0x | 1.0x | 2 XP |
| Medium commit, PASS | 2 | 1.0x | 1.0x | 2 XP |
| Hard commit, PASS | 2 | 1.0x | 1.2x | 2.4 → 2 XP |
| Hard commit, REVIEW | 2 | 0.5x | 1.2x | 1.2 → 1 XP |
| Hard commit, FAIL | 2 | 0.0x | 1.2x | 0 XP |
| Assignment XP bonus | 100 | 1.0x | 1.2x | 120 XP |

---

## Badge System

### Automatic Badge Unlocking

#### 1. "First Commit" Badge 🎯
- **Trigger:** First push to any assignment
- **Criteria:** `submission.commits.length >= 1`
- **XP Bonus:** +10 XP
- **Description:** "You've made your first commit!"

#### 2. "Commit Streak" Badge 🔥
- **Trigger:** 5+ commits within 7 days
- **Criteria:** `commits_in_last_7_days >= 5`
- **XP Bonus:** +25 XP
- **Description:** "You're on a roll! 5 commits in 7 days"

#### 3. "Code Master" Badge 👑
- **Trigger:** Achieve PASS status (≥80 score)
- **Criteria:** `submission.status === 'PASS'`
- **XP Bonus:** +50 XP
- **Description:** "Your code passed all checks!"

#### 4. "Feedback Listener" Badge 💡
- **Trigger:** Implement AI suggestions in next commit
- **Criteria:** Detect changes matching feedback suggestions
- **XP Bonus:** +30 XP
- **Description:** "You implemented AI mentor suggestions!"

#### 5. "Consistency" Badge ⭐
- **Trigger:** Complete 3+ assignments with PASS status
- **Criteria:** `passed_assignments >= 3`
- **XP Bonus:** +75 XP
- **Description:** "3 assignments passed! You're consistent!"

#### 6. "Speed Demon" Badge ⚡
- **Trigger:** Complete assignment within 24 hours
- **Criteria:** `submission.created_at - assignment.created_at <= 24h`
- **XP Bonus:** +40 XP
- **Description:** "Completed in under 24 hours!"

### Badge Display
- Show in user profile
- Display on leaderboard
- Animate when unlocked
- Show in dashboard achievements section

---

## Level Progression System

### Level Calculation
```
Level = floor(totalXP / 100)

Examples:
  0-99 XP = Level 1
  100-199 XP = Level 2
  200-299 XP = Level 3
  ...
  1000+ XP = Level 11+
```

### Level Up Rewards
- **XP Bonus:** +50 XP
- **Animation:** Celebration effect
- **Notification:** "⭐ Level Up! You're now Level X"
- **Badge:** "Level X Achieved"
- **Leaderboard:** Rank recalculated

### Level Milestones
| Level | XP Required | Milestone |
|-------|-------------|-----------|
| 1 | 0 | Beginner |
| 2 | 100 | Novice |
| 3 | 200 | Apprentice |
| 5 | 400 | Intermediate |
| 10 | 900 | Advanced |
| 15 | 1400 | Expert |
| 20 | 1900 | Master |

---

## Leaderboard Real-Time Updates

### Update Trigger
Every time XP is awarded:
1. Update user.totalXp in PostgreSQL
2. Update Redis leaderboard cache
3. Broadcast WebSocket event to all clients
4. Recalculate rankings

### Redis Cache Structure
```json
{
  "leaderboard:daily": [
    { "rank": 1, "userId": "user123", "username": "alice", "xp": 450, "level": 4 },
    { "rank": 2, "userId": "user456", "username": "bob", "xp": 420, "level": 4 },
    { "rank": 3, "userId": "user789", "username": "charlie", "xp": 380, "level": 3 }
  ],
  "leaderboard:weekly": [...],
  "leaderboard:monthly": [...]
}
```

### WebSocket Broadcast
```javascript
// When XP is awarded
socket.broadcast.emit('xp-earned', {
  userId: 'user123',
  username: 'alice',
  xpEarned: 2,
  totalXp: 452,
  level: 4,
  newRank: 1,
  previousRank: 2,
  badgeUnlocked: 'First Commit'
});
```

---

## AI Mentor Feedback Integration

### Feedback Generation Trigger
After auto-grading completes:
1. Extract git diff
2. Get score breakdown
3. Retrieve assignment requirements
4. Send to Ollama (local LLM)

### Feedback Prompt
```
You are an AI mentor helping students improve their code.

Assignment: {assignment.title}
Requirements: {assignment.description}

Student's Code Diff:
{git_diff}

Auto-Grading Score: {score}/100
Score Breakdown:
- Commit Message Quality: {breakdown.commitMessageQuality}/10
- Number of Commits: {breakdown.numberOfCommits}/10
- Lines Balance: {breakdown.linesBalance}/15
- Required Files: {breakdown.requiredFiles}/20
- Folder Structure: {breakdown.folderStructure}/25
- README Quality: {breakdown.readmeQuality}/20

Student's Previous Submissions:
{previous_submissions_summary}

Please provide:
1. Strengths (what they did well)
2. Issues (what needs improvement)
3. Specific suggestions (actionable improvements)
4. Confidence score (0-100)

Format as JSON:
{
  "strengths": ["...", "..."],
  "issues": ["...", "..."],
  "suggestions": ["...", "..."],
  "confidence": 85
}
```

### Feedback Response Parsing
```javascript
{
  "strengths": [
    "Good error handling with try-catch blocks",
    "Clear variable naming conventions",
    "Proper use of async/await"
  ],
  "issues": [
    "Missing input validation",
    "No unit tests provided",
    "README lacks usage examples"
  ],
  "suggestions": [
    "Add input validation for all API endpoints",
    "Write unit tests for core functions",
    "Include usage examples in README",
    "Consider adding TypeScript for type safety"
  ],
  "confidence": 87
}
```

### Feedback Display
- Show in submission detail card
- Highlight strengths (green)
- Highlight issues (orange)
- Show suggestions (blue)
- Display confidence score
- Link to "Feedback Listener" badge

---

## Real-Time Notifications

### Notification Types

#### 1. XP Earned
```
🎯 +2 XP
You earned 2 XP from your commit!
```

#### 2. Badge Unlocked
```
🏆 Badge Unlocked: First Commit
You've made your first commit!
+10 XP Bonus
```

#### 3. Level Up
```
⭐ Level Up!
You're now Level 2!
+50 XP Bonus
```

#### 4. Leaderboard Rank Change
```
📈 Rank Updated
You moved from #5 to #3 on the leaderboard!
```

#### 5. Feedback Ready
```
💡 AI Mentor Feedback Ready
Your submission has been analyzed. Check it out!
```

### Notification Delivery
- **Toast notification** (top-right corner)
- **Dashboard badge** (notification count)
- **Email** (optional, for level-ups)
- **WebSocket** (real-time)
- **In-app** (notification center)

---

## Integration Points

### 1. Analytics Dashboard (Task 9)
```
GitHub Commits
    ↓
Activity Chart: Shows commit frequency
Skill Chart: Languages used in commits
Progress Chart: XP growth from commits
```

### 2. Gamification System (Task 11)
```
GitHub XP
    ↓
XP Event Handler
    ├→ Add to totalXp
    ├→ Recalculate level
    ├→ Check badge criteria
    └→ Update leaderboard
```

### 3. Real-time Updates (Task 17)
```
XP Awarded
    ↓
WebSocket Broadcast
    ├→ Leaderboard update
    ├→ Notification delivery
    └→ Dashboard refresh
```

### 4. User Profile (Task 13)
```
GitHub Commits
    ↓
Update Profile
    ├→ Total XP
    ├→ Current Level
    ├→ Badges earned
    └→ Streak count
```

### 5. Teacher Dashboard (Task 14)
```
Student Submissions
    ↓
View Analytics
    ├→ XP earned
    ├→ Badges unlocked
    ├→ Level progression
    └→ Commit history
```

---

## Implementation Details

### Backend Service: `githubPushToXpService.ts`

```typescript
async function processPushEvent(webhook: GitHubWebhook) {
  // 1. Extract metadata
  const { commits, author, timestamp } = webhook;
  
  // 2. Find student and assignment
  const student = await findStudentByGitHubUsername(author);
  const submission = await findSubmissionByRepo(webhook.repo);
  
  // 3. Award XP
  const xpEarned = calculateXP(
    submission.assignment.difficulty,
    submission.status
  );
  await awardXP(student.id, xpEarned);
  
  // 4. Check badges
  const unlockedBadges = await checkBadgeCriteria(student.id, submission);
  for (const badge of unlockedBadges) {
    await unlockBadge(student.id, badge);
  }
  
  // 5. Update level
  const newLevel = calculateLevel(student.totalXp);
  if (newLevel > student.level) {
    await levelUp(student.id, newLevel);
  }
  
  // 6. Update leaderboard
  await updateLeaderboard(student.id);
  
  // 7. Generate feedback
  const feedback = await generateAIFeedback(submission);
  await storeFeedback(submission.id, feedback);
  
  // 8. Send notifications
  await notifyStudent(student.id, {
    xpEarned,
    unlockedBadges,
    leveledUp: newLevel > student.level,
    feedbackReady: true
  });
  
  // 9. Broadcast updates
  io.emit('xp-earned', {
    userId: student.id,
    xpEarned,
    totalXp: student.totalXp + xpEarned,
    level: newLevel,
    badges: unlockedBadges
  });
}
```

### Frontend Component: `PushToXpNotification.tsx`

```typescript
export const PushToXpNotification: React.FC<{
  xpEarned: number;
  badges: Badge[];
  leveledUp: boolean;
  feedbackReady: boolean;
}> = ({ xpEarned, badges, leveledUp, feedbackReady }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-cyan-500 to-magenta-500 
                 rounded-lg p-4 text-white shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="font-bold">+{xpEarned} XP</p>
          {badges.length > 0 && (
            <p className="text-sm">🏆 {badges.length} badge(s) unlocked!</p>
          )}
          {leveledUp && <p className="text-sm">⭐ Level Up!</p>}
          {feedbackReady && <p className="text-sm">💡 Feedback ready</p>}
        </div>
      </div>
    </motion.div>
  );
};
```

---

## Data Flow Diagram

```
GitHub Push Event
        ↓
Webhook Received
        ↓
Extract Metadata
├─ Commit SHA, author, timestamp
├─ Changed files, diff
└─ Commit message
        ↓
Find Student & Assignment
        ↓
Calculate XP
├─ Base: 2 XP
├─ Status multiplier
└─ Difficulty multiplier
        ↓
Award XP
├─ Update user.totalXp
└─ Store XP event
        ↓
Check Badge Criteria
├─ First Commit?
├─ Commit Streak?
├─ Code Master?
├─ Feedback Listener?
└─ Consistency?
        ↓
Unlock Badges (if any)
├─ Add to user_badges
└─ Award bonus XP
        ↓
Recalculate Level
├─ level = floor(totalXp / 100)
└─ Award level-up bonus if advanced
        ↓
Update Leaderboard
├─ Update Redis cache
└─ Recalculate rankings
        ↓
Generate AI Feedback
├─ Send diff to Ollama
├─ Parse response
└─ Store feedback
        ↓
Send Notifications
├─ XP earned
├─ Badges unlocked
├─ Level up
└─ Feedback ready
        ↓
Broadcast WebSocket
├─ Leaderboard update
├─ User profile update
└─ Dashboard refresh
        ↓
Student Sees:
├─ XP earned notification
├─ Badge unlocked animation
├─ Level up celebration
├─ Updated leaderboard rank
├─ AI feedback card
└─ Updated profile stats
```

---

## Success Criteria

✅ Every commit awards XP (+2 base)
✅ Badges unlock automatically based on criteria
✅ Levels advance as XP accumulates
✅ Leaderboard updates in real-time
✅ AI feedback generates for every submission
✅ Notifications sent for all events
✅ All systems integrated seamlessly
✅ 100% powered by free GitHub metadata
✅ No paid APIs or services
✅ Demo-ready in < 5 minutes

---

## Demo Script

```
1. Student pushes code to GitHub
   Commit: "Add API endpoints"
   
2. GitHub webhook triggers
   
3. System processes:
   ✓ Extracts metadata
   ✓ Awards +2 XP
   ✓ Checks badges → "First Commit" unlocked (+10 XP)
   ✓ Recalculates level → Level 2 (+50 XP)
   ✓ Updates leaderboard → Rank #3
   ✓ Generates AI feedback
   ✓ Sends notifications
   
4. Student sees in dashboard:
   🎯 +2 XP
   🏆 Badge: First Commit (+10 XP)
   ⭐ Level Up! Level 2 (+50 XP)
   📈 Rank: #3
   💡 AI Feedback: "Good error handling..."
   
5. Total XP earned: 62 XP
   Total time: < 30 seconds
```

---

## Files to Create/Modify

### Backend
- `backend/src/services/githubPushToXpService.ts` (NEW)
- `backend/src/services/badgeService.ts` (NEW)
- `backend/src/services/levelService.ts` (NEW)
- `backend/src/services/notificationService.ts` (NEW)
- `backend/src/routes/webhooks.ts` (MODIFY)
- `backend/src/database/schema.sql` (MODIFY - add badge tables)

### Frontend
- `frontend/src/components/Notifications/PushToXpNotification.tsx` (NEW)
- `frontend/src/components/Notifications/BadgeUnlockedAnimation.tsx` (NEW)
- `frontend/src/components/Notifications/LevelUpCelebration.tsx` (NEW)
- `frontend/src/hooks/usePushToXpEvents.ts` (NEW)

---

## Conclusion

Task 9.6 is the **glue that binds everything together**. It transforms GitHub pushes into a complete gamification experience where every action has immediate, visible rewards. This is what makes GamifyX engaging and motivating for students.

**"Students submit assignments by pushing to GitHub; every commit earns XP, unlocks badges, advances levels, updates leaderboards, and receives AI mentor feedback — all powered by free GitHub metadata."** ✨
