export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  level: number
  totalXp: number
  role: 'student' | 'teacher' | 'admin'
  createdAt: Date
  updatedAt: Date
}

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

export interface Badge {
  id: string
  name: string
  description: string
  criteria: string
  icon: string
  createdAt: Date
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  xp: number
  streak: number
}

export interface FocusSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number
  xpReward?: number
  status: 'active' | 'completed' | 'abandoned'
}

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

export interface Assignment {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  xpReward: number
  requiredFiles: string[]
  expectedFolderStructure: string
  deadline: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  githubRepoUrl: string
  branch: string
  status: 'IN_PROGRESS' | 'PASS' | 'REVIEW' | 'FAIL'
  score: number
  autoGradingBreakdown: {
    commitMessageQuality: number
    commitCount: number
    linesBalance: number
    requiredFilesPresent: number
    folderStructure: number
    readmeQuality: number
  }
  feedbackId?: string
  xpEarned: number
  submittedAt: Date
  updatedAt: Date
}

export interface StudentAssignment {
  assignment: Assignment
  submission?: AssignmentSubmission
  accepted: boolean
  acceptedAt?: Date
}

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
  username: string
  avatar?: string
  submissionCount: number
  qualityScore: number
  xpEarned: number
  joinedAt: Date
}

export interface CompetitionResult {
  competitionId: string
  rank: number
  userId: string
  username: string
  avatar?: string
  submissionCount: number
  qualityScore: number
  xpEarned: number
}
