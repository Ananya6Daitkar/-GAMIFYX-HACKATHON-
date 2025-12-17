// User Model
export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  avatar?: string
  level: number
  totalXp: number
  role: 'student' | 'teacher' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  user: User
  badges: Badge[]
  streak: number
  submissions: Submission[]
}

// Submission Model
export interface Submission {
  id: string
  studentId: string
  code: string
  language: string
  status: 'pending' | 'approved' | 'revision_needed'
  feedbackId?: string
  createdAt: Date
  updatedAt: Date
}

// AI Feedback Model
export interface AIFeedback {
  id: string
  submissionId: string
  insights: string[]
  confidenceScore: number
  codeReferences: CodeReference[]
  generatedAt: Date
}

export interface CodeReference {
  lineNumber: number
  snippet: string
  suggestion: string
}

// Badge Model
export interface Badge {
  id: string
  name: string
  description: string
  criteria: string
  icon: string
  createdAt: Date
}

export interface UserBadge {
  userId: string
  badgeId: string
  earnedAt: Date
}

// Leaderboard Model
export interface Leaderboard {
  id: string
  period: 'daily' | 'weekly' | 'monthly'
  entries: LeaderboardEntry[]
  updatedAt: Date
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  xp: number
  streak: number
}

// Focus Session Model
export interface FocusSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number
  xpReward?: number
  status: 'active' | 'completed' | 'abandoned'
  createdAt: Date
}

// Feedback/Contact Model
export interface Feedback {
  id: string
  userId: string
  category: string
  subject: string
  message: string
  attachments?: string[]
  assignedTo?: string
  status: 'open' | 'in_progress' | 'resolved'
  auditTrail?: AuditEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface AuditEntry {
  timestamp: Date
  action: string
  actor: string
  details?: string
}

// XP Event Model
export interface XPEvent {
  userId: string
  amount: number
  reason: string
  timestamp: Date
}

// Analytics Models
export interface UserAnalytics {
  userId: string
  activityTimeline: ActivityPoint[]
  skillDistribution: SkillLevel[]
  progressOverTime: ProgressPoint[]
}

export interface ActivityPoint {
  date: Date
  submissionCount: number
  xpEarned: number
}

export interface SkillLevel {
  language: string
  proficiency: number
}

export interface ProgressPoint {
  date: Date
  totalXp: number
  level: number
}

// GitHub Integration Models
export interface GitHubUser {
  id: string
  userId: string
  githubUsername: string
  githubId: number
  githubToken: string
  githubRefreshToken?: string
  tokenExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Assignment Models
export interface Assignment {
  id: string
  teacherId: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  xpReward: number
  requiredFiles: string[]
  expectedFolderStructure?: string
  deadline: Date
  createdAt: Date
  updatedAt: Date
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'PASS' | 'REVIEW' | 'FAIL'
  githubRepoUrl: string
  githubBranch: string
  autoGradeScore?: number
  xpEarned: number
  createdAt: Date
  updatedAt: Date
}

export interface GitHubWebhook {
  id: string
  assignmentSubmissionId: string
  webhookId: number
  repositoryName: string
  lastPushSha?: string
  lastPushTimestamp?: Date
  createdAt: Date
  updatedAt: Date
}

// Competition Models
export interface Competition {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  rules: string
  requirements: string
  xpReward: number
  startTime: Date
  endTime: Date
  createdAt: Date
  updatedAt: Date
}

export interface CompetitionParticipant {
  id: string
  competitionId: string
  userId: string
  submissionCount: number
  qualityScore: number
  xpEarned: number
  joinedAt: Date
}

export interface CompetitionResult {
  competitionId: string
  rank: number
  userId: string
  submissionCount: number
  qualityScore: number
  xpEarned: number
}
