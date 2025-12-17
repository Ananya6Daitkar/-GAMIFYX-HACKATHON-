# GamifyX Platform - Design Document

## Overview

GamifyX is a full-stack AI-powered gamified learning platform with a modern cyberpunk UI/UX. The platform consists of:

- **Frontend**: React application with real-time WebSocket updates, responsive design (320px-1920px+), and cyberpunk theme
- **Backend**: Node.js/Express API with PostgreSQL database, Redis caching, and Ollama integration for AI feedback
- **AI Services**: Local LLM (Mistral 7B via Ollama) for context-aware code analysis and feedback generation
- **Real-time**: WebSocket server for live leaderboard updates, notifications, and XP changes

The design prioritizes user engagement through gamification mechanics, visual polish with neon glow effects and glass morphism, and intelligent AI-driven feedback that adapts to student skill levels.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Dashboard | Leaderboard | Achievements | Submissions       │
│  Analytics | Profile | Teacher Dashboard | Competitions     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                  API Gateway (Express)                       │
│  Auth | Users | Submissions | Gamification | Analytics      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐  ┌─────▼──┐  ┌─────▼──┐
   │PostgreSQL│  │Redis  │  │Ollama  │
   │Database  │  │Cache  │  │LLM     │
   └─────────┘  └────────┘  └────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Dashboard Component
- **StatCard**: Animated card displaying XP, Level, Badges, Streak with neon glow
- **HeroSection**: Large header with user avatar, level indicator, and welcome message
- **RecentActivity**: List of recent submissions and achievements
- **QuickStats**: Summary metrics with trend indicators

#### 2. Leaderboard Component
- **LeaderboardTable**: Ranked list with top 3 special styling (gold/silver/bronze)
- **TimeFilter**: Toggle between daily, weekly, monthly views
- **RankAnimation**: Smooth position transitions when rankings change
- **UserRankCard**: Individual rank display with avatar and stats

#### 3. Achievements Component
- **BadgeGrid**: Responsive grid of earned/unearned badges
- **BadgeCard**: Individual badge with tooltip, color/grayscale state
- **BadgeTooltip**: Shows badge name, description, unlock criteria
- **CelebrationAnimation**: Confetti/pop animation when badge earned

#### 4. Submissions Component
- **SubmissionList**: List view with status indicators (green/yellow/red)
- **SubmissionCard**: Expandable card showing submission metadata
- **CodePreview**: Syntax-highlighted code viewer with line numbers
- **FeedbackPanel**: AI feedback display with color-coded insights

#### 5. Analytics Component
- **ActivityChart**: Line chart showing submissions per day (30-day history)
- **SkillChart**: Bar chart showing proficiency by language
- **ProgressChart**: Area chart showing XP growth over time
- **ChartTooltip**: Interactive tooltip with detailed data

#### 6. AI Feedback Component
- **FeedbackCard**: Color-coded feedback (green/orange) with confidence score
- **ConfidenceIndicator**: Visual representation of feedback reliability (0-100%)
- **CodeSnippet**: Referenced code with line numbers highlighted
- **SuggestionList**: Bulleted list of actionable improvements

#### 7. Focus Lock Mode Component
- **FocusButton**: Activation button with warning dialog
- **FocusOverlay**: Fullscreen overlay with timer and XP multiplier
- **ExitWarning**: Dialog preventing accidental exit
- **SessionSummary**: Post-session XP reward display

#### 8. Profile Component
- **ProfileHeader**: Avatar, username, email, level display
- **StatsSection**: Total XP, badges earned, streak count
- **EditForm**: Editable fields with validation (email, username, avatar)
- **SaveButton**: Persists changes with success notification

#### 9. Teacher Dashboard Component
- **ClassOverview**: Total students, average XP, class leaderboard
- **StudentList**: Table with progress bars and intervention indicators
- **StudentDetail**: Detailed analytics and submission history for selected student
- **SubmissionReview**: Interface for marking submissions and providing feedback

#### 10. Navigation Component
- **Sidebar**: Persistent on desktop, toggleable on mobile with hamburger menu
- **NavLink**: Links with neon glow on hover
- **UserMenu**: Dropdown with profile, settings, logout
- **NotificationBell**: Shows unread notifications count

### Backend Interfaces

#### User Service
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  totalXP: number;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
}

interface UserProfile {
  user: User;
  badges: Badge[];
  streak: number;
  submissions: Submission[];
}
```

#### Submission Service
```typescript
interface Submission {
  id: string;
  studentId: string;
  code: string;
  language: string;
  status: 'pending' | 'approved' | 'revision_needed';
  feedback?: AIFeedback;
  createdAt: Date;
  updatedAt: Date;
}

interface AIFeedback {
  id: string;
  submissionId: string;
  insights: string[];
  confidenceScore: number;
  codeReferences: CodeReference[];
  generatedAt: Date;
}

interface CodeReference {
  lineNumber: number;
  snippet: string;
  suggestion: string;
}
```

#### Gamification Service
```typescript
interface XPEvent {
  userId: string;
  amount: number;
  reason: string;
  timestamp: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
}

interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly';
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  xp: number;
  streak: number;
}
```

#### Analytics Service
```typescript
interface UserAnalytics {
  userId: string;
  activityTimeline: ActivityPoint[];
  skillDistribution: SkillLevel[];
  progressOverTime: ProgressPoint[];
}

interface ActivityPoint {
  date: Date;
  submissionCount: number;
  xpEarned: number;
}

interface SkillLevel {
  language: string;
  proficiency: number; // 0-100
}

interface ProgressPoint {
  date: Date;
  totalXP: number;
  level: number;
}
```

#### Focus Lock Service
```typescript
interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  xpReward: number;
  status: 'active' | 'completed' | 'abandoned';
}
```

## Data Models

### User Model
- id (UUID)
- username (string, unique)
- email (string, unique)
- passwordHash (string)
- avatar (string, URL)
- level (number, default: 1)
- totalXP (number, default: 0)
- role (enum: student, teacher, admin)
- createdAt (timestamp)
- updatedAt (timestamp)

### Submission Model
- id (UUID)
- studentId (UUID, foreign key)
- code (text)
- language (string)
- status (enum: pending, approved, revision_needed)
- feedbackId (UUID, foreign key, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)

### AIFeedback Model
- id (UUID)
- submissionId (UUID, foreign key)
- insights (text array)
- confidenceScore (number, 0-100)
- codeReferences (JSON)
- generatedAt (timestamp)

### Badge Model
- id (UUID)
- name (string)
- description (string)
- criteria (string)
- icon (string, URL)
- createdAt (timestamp)

### UserBadge Model (junction table)
- userId (UUID, foreign key)
- badgeId (UUID, foreign key)
- earnedAt (timestamp)

### Leaderboard Model (cached in Redis)
- period (enum: daily, weekly, monthly)
- entries (JSON array)
- updatedAt (timestamp)

### FocusSession Model
- id (UUID)
- userId (UUID, foreign key)
- startTime (timestamp)
- endTime (timestamp, nullable)
- duration (number)
- xpReward (number)
- status (enum: active, completed, abandoned)

### Feedback Model
- id (UUID)
- userId (UUID, foreign key)
- category (string)
- subject (string)
- message (text)
- attachments (string array, URLs)
- assignedTo (UUID, foreign key, nullable)
- status (enum: open, in_progress, resolved)
- auditTrail (JSON)
- createdAt (timestamp)
- updatedAt (timestamp)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: XP Accumulation Consistency
*For any* student and any XP event, the student's total XP should increase by exactly the event amount, and the new total should be persisted to the database.
**Validates: Requirements 1.1, 6.1**

### Property 2: Leaderboard Ranking Accuracy
*For any* leaderboard period (daily, weekly, monthly), the ranking order should be strictly descending by XP, with ties broken by earliest earned timestamp.
**Validates: Requirements 2.1, 2.4**

### Property 3: Badge Earning Idempotence
*For any* student and any badge, earning the badge multiple times should result in exactly one earned badge entry with the earliest earn timestamp preserved.
**Validates: Requirements 3.1, 3.2**

### Property 4: Submission Status Transitions
*For any* submission, the status should only transition through valid states (pending → approved OR pending → revision_needed), and status changes should be immutable once approved.
**Validates: Requirements 4.1, 4.2**

### Property 5: AI Feedback Confidence Validity
*For any* AI feedback, the confidence score should be a number between 0 and 100 (inclusive), and feedback with confidence < 50 should include a disclaimer.
**Validates: Requirements 6.2, 6.3**

### Property 6: Focus Session XP Reward Calculation
*For any* completed focus session, the XP reward should equal (session duration in minutes × base rate) + (streak bonus if applicable), and should be awarded exactly once.
**Validates: Requirements 7.4**

### Property 7: Feedback Routing Correctness
*For any* submitted feedback, the system should route it to exactly one assigned mentor/teacher based on category, and create an audit trail entry with timestamp and submission details.
**Validates: Requirements 8.2, 8.3**

### Property 8: Profile Data Persistence
*For any* profile update (avatar, username, email), the changes should be persisted to the database and reflected in subsequent queries without requiring page refresh.
**Validates: Requirements 10.2, 10.4**

### Property 9: Responsive Layout Adaptation
*For any* viewport width, the layout should adapt to the correct breakpoint (mobile ≤ 768px, tablet 768-1024px, desktop > 1024px) without horizontal scrolling or layout shift.
**Validates: Requirements 13.1, 13.2, 13.3**

### Property 10: Real-time Update Delivery
*For any* XP event or leaderboard change, all connected WebSocket clients should receive the update within 500ms and reflect the change in the UI.
**Validates: Requirements 16.1, 16.2**

### Property 11: Accessibility Keyboard Navigation
*For any* interactive element on the page, keyboard navigation (Tab key) should cycle through all focusable elements in logical order, and Enter/Space should activate buttons.
**Validates: Requirements 14.2**

### Property 12: Performance Load Time
*For any* page load, the initial page should be fully interactive within 2 seconds on a 4G connection with typical hardware.
**Validates: Requirements 14.1**

### Property 13: Notification Delivery Consistency
*For any* user action (submission, badge earned, feedback received), the system should display a notification within 1 second and persist it until dismissed or auto-cleared after 5 seconds.
**Validates: Requirements 17.1, 17.2**

### Property 14: Competition Results Accuracy
*For any* completed competition, the final rankings should be based on submission count and quality score, and results should be immutable after competition end time.
**Validates: Requirements 12.4**

### Property 15: Teacher Intervention Indicator Accuracy
*For any* student with XP < 10th percentile of class average, the system should display a red intervention indicator, and this indicator should update within 1 minute of XP changes.
**Validates: Requirements 9.3**

## Error Handling

### Client-side Error Handling
- Network errors: Display retry button with exponential backoff
- Validation errors: Show inline error messages with red text and icon
- Authentication errors: Redirect to login with error message
- Rate limiting: Display "Too many requests" message with retry timer

### Server-side Error Handling
- Database errors: Log error, return 500 with generic message to client
- Invalid input: Return 400 with specific validation error messages
- Unauthorized access: Return 401 with redirect to login
- Resource not found: Return 404 with helpful message

### AI Feedback Error Handling
- Ollama connection failure: Return cached feedback or generic suggestion
- Timeout (>10s): Return partial feedback with confidence score < 30
- Invalid code: Return error message suggesting code review

## Testing Strategy

### Unit Testing
- Test individual components in isolation (Dashboard, Leaderboard, etc.)
- Test utility functions (XP calculation, badge criteria checking, etc.)
- Test data validation (email format, username uniqueness, etc.)
- Test error handling (network errors, invalid input, etc.)

### Property-Based Testing
- Use fast-check library for JavaScript/TypeScript
- Configure each property test to run minimum 100 iterations
- Test XP accumulation with random XP amounts and students
- Test leaderboard ranking with random student data
- Test badge earning with random badge criteria
- Test submission status transitions with random state changes
- Test focus session XP rewards with random durations
- Test responsive layout with random viewport widths
- Test real-time updates with random event timing
- Test keyboard navigation with random element focus order

### Integration Testing
- Test API endpoints with real database
- Test WebSocket real-time updates
- Test Ollama integration for AI feedback
- Test authentication flow
- Test end-to-end user journeys (submit code → receive feedback → earn XP)

### Performance Testing
- Measure page load time (target: < 2 seconds)
- Measure API response time (target: < 500ms)
- Measure WebSocket message delivery (target: < 500ms)
- Test with 1000+ concurrent users on leaderboard

### Accessibility Testing
- Test keyboard navigation (Tab, Enter, Escape)
- Test screen reader compatibility (ARIA labels)
- Test color contrast (WCAG AA standard)
- Test with reduced motion preference

