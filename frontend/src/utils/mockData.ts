import { User, Badge, LeaderboardEntry, Assignment, AssignmentSubmission, AIFeedback } from '../types/index'

export const mockUser: User = {
  id: 'd54bef60-d7ba-4316-9c80-71366805585f',
  username: 'testuser',
  email: 'test@example.com',
  avatar: null,
  level: 5,
  totalXp: 450,
  role: 'student',
  createdAt: new Date('2025-12-01'),
  updatedAt: new Date(),
}

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Commit',
    description: 'Made your first code submission',
    criteria: 'Submit first assignment',
    icon: '🚀',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Code Master',
    description: 'Achieved PASS status on submission',
    criteria: 'Score 80+ on assignment',
    icon: '👨‍💻',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Streak Warrior',
    description: '5+ commits in 7 days',
    criteria: 'Maintain commit streak',
    icon: '🔥',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Feedback Listener',
    description: 'Implemented AI suggestions',
    criteria: 'Apply feedback to code',
    icon: '💡',
    createdAt: new Date(),
  },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'user1', username: 'AlexCoder', xp: 850, streak: 12 },
  { rank: 2, userId: 'user2', username: 'DevMaster', xp: 720, streak: 8 },
  { rank: 3, userId: 'user3', username: 'CodeNinja', xp: 650, streak: 10 },
  { rank: 4, userId: 'd54bef60-d7ba-4316-9c80-71366805585f', username: 'testuser', xp: 450, streak: 5 },
  { rank: 5, userId: 'user5', username: 'WebWizard', xp: 380, streak: 3 },
  { rank: 6, userId: 'user6', username: 'DataDriven', xp: 320, streak: 6 },
  { rank: 7, userId: 'user7', username: 'CloudKing', xp: 280, streak: 4 },
  { rank: 8, userId: 'user8', username: 'APIGuru', xp: 240, streak: 2 },
  { rank: 9, userId: 'user9', username: 'FullStack', xp: 200, streak: 7 },
  { rank: 10, userId: 'user10', username: 'DevOpsHero', xp: 150, streak: 1 },
]

export const mockAssignments: Assignment[] = [
  {
    id: 'assign1',
    title: 'Build REST API',
    description: 'Create a REST API with Node.js and Express',
    difficulty: 'MEDIUM',
    xpReward: 100,
    requiredFiles: ['server.js', 'package.json', 'README.md'],
    expectedFolderStructure: 'src/, tests/, docs/',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: 'teacher1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'assign2',
    title: 'Deploy to AWS',
    description: 'Deploy your application to AWS EC2',
    difficulty: 'HARD',
    xpReward: 150,
    requiredFiles: ['Dockerfile', 'docker-compose.yml', 'deployment.md'],
    expectedFolderStructure: 'infra/, app/, scripts/',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdBy: 'teacher1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'assign3',
    title: 'Write Unit Tests',
    description: 'Write comprehensive unit tests for your code',
    difficulty: 'EASY',
    xpReward: 50,
    requiredFiles: ['test.js', 'coverage.md'],
    expectedFolderStructure: 'tests/',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdBy: 'teacher1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockSubmissions: AssignmentSubmission[] = [
  {
    id: 'sub1',
    assignmentId: 'assign1',
    studentId: 'd54bef60-d7ba-4316-9c80-71366805585f',
    githubRepoUrl: 'https://github.com/testuser/rest-api',
    branch: 'main',
    status: 'PASS',
    score: 92,
    autoGradingBreakdown: {
      commitMessageQuality: 9,
      commitCount: 8,
      linesBalance: 14,
      requiredFilesPresent: 20,
      folderStructure: 24,
      readmeQuality: 17,
    },
    xpEarned: 120,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  } as any,
  {
    id: 'sub2',
    assignmentId: 'assign3',
    studentId: 'd54bef60-d7ba-4316-9c80-71366805585f',
    githubRepoUrl: 'https://github.com/testuser/unit-tests',
    branch: 'main',
    status: 'REVIEW',
    score: 65,
    autoGradingBreakdown: {
      commitMessageQuality: 6,
      commitCount: 5,
      linesBalance: 10,
      requiredFilesPresent: 15,
      folderStructure: 18,
      readmeQuality: 11,
    },
    xpEarned: 25,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  } as any,
]

export const mockAIFeedback: AIFeedback = {
  id: 'feedback1',
  submissionId: 'sub1',
  insights: [
    '✅ Excellent error handling with try-catch blocks',
    '⚠️ Consider adding input validation for API endpoints',
    '💡 Use environment variables for configuration instead of hardcoding',
    '✅ Good separation of concerns with middleware',
  ],
  confidenceScore: 92,
  codeReferences: [
    {
      lineNumber: 45,
      snippet: 'app.post("/api/users", (req, res) => {',
      suggestion: 'Add request validation middleware before handler',
    },
    {
      lineNumber: 78,
      snippet: 'const PORT = 3000',
      suggestion: 'Use process.env.PORT || 3000 for flexibility',
    },
  ],
  generatedAt: new Date(),
}

export const mockAnalyticsData = {
  activityChart: [
    { date: 'Mon', submissions: 2 },
    { date: 'Tue', submissions: 3 },
    { date: 'Wed', submissions: 1 },
    { date: 'Thu', submissions: 4 },
    { date: 'Fri', submissions: 3 },
    { date: 'Sat', submissions: 2 },
    { date: 'Sun', submissions: 1 },
  ],
  skillChart: [
    { language: 'JavaScript', proficiency: 85 },
    { language: 'Python', proficiency: 72 },
    { language: 'TypeScript', proficiency: 78 },
    { language: 'SQL', proficiency: 65 },
    { language: 'Docker', proficiency: 58 },
  ],
  progressChart: [
    { week: 'Week 1', xp: 100 },
    { week: 'Week 2', xp: 250 },
    { week: 'Week 3', xp: 380 },
    { week: 'Week 4', xp: 450 },
  ],
}
