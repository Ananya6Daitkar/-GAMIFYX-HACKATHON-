import crypto from 'crypto'
import { AssignmentSubmission, Assignment } from '../database/models'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'
import assignmentRepository from '../database/repositories/assignmentRepository'
import userRepository from '../database/repositories/userRepository'
import githubWebhookRepository from '../database/repositories/githubWebhookRepository'
import assignmentService from './assignmentService'
import githubPushToXpService from './githubPushToXpService'

interface GitHubPushPayload {
  ref: string
  before: string
  after: string
  repository: {
    id: number
    name: string
    full_name: string
    owner: {
      name: string
      login: string
    }
  }
  pusher: {
    name: string
    email: string
  }
  commits: Array<{
    id: string
    message: string
    timestamp: string
    author: {
      name: string
      email: string
    }
    added: string[]
    removed: string[]
    modified: string[]
  }>
  head_commit: {
    id: string
    message: string
    timestamp: string
    author: {
      name: string
      email: string
    }
    added: string[]
    removed: string[]
    modified: string[]
  } | null
}

interface AutoGradeResult {
  score: number
  breakdown: {
    commitMessageQuality: number
    commitCount: number
    linesBalance: number
    requiredFilesPresent: number
    folderStructure: number
    readmeQuality: number
  }
  status: 'PASS' | 'REVIEW' | 'FAIL'
  details: string[]
}

class GitHubWebhookService {
  private webhookSecret: string

  constructor(webhookSecret: string) {
    this.webhookSecret = webhookSecret
  }

  /**
   * Verify GitHub webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')

    const expectedSignature = `sha256=${hash}`
    
    // Check length first to avoid timing safe equal error
    if (Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature)) {
      return false
    }
    
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch {
      return false
    }
  }

  /**
   * Handle GitHub push webhook event
   */
  async handlePushEvent(payload: GitHubPushPayload, submissionId: string): Promise<AssignmentSubmission> {
    // Get the submission
    const submission = await assignmentSubmissionRepository.findById(submissionId)
    if (!submission) {
      throw new Error('Submission not found')
    }

    // Get the assignment
    const assignment = await assignmentRepository.findById(submission.assignmentId)
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Auto-grade the submission
    const gradeResult = await this.autoGradeSubmission(payload, assignment, submission)

    // Calculate XP reward
    const xpReward = assignmentService.calculateXPReward(
      assignment.xpReward,
      gradeResult.score,
      assignment.difficulty
    )

    // Update submission with grade and XP
    const updatedSubmission = await assignmentSubmissionRepository.updateGradeAndXP(
      submissionId,
      gradeResult.score,
      xpReward
    )

    // Update submission status
    const finalSubmission = await assignmentSubmissionRepository.updateStatus(submissionId, gradeResult.status)

    // Store webhook record
    await githubWebhookRepository.create({
      assignmentSubmissionId: submissionId,
      webhookId: payload.repository.id,
      repositoryName: payload.repository.name,
      lastPushSha: payload.after,
      lastPushTimestamp: new Date(payload.head_commit?.timestamp || new Date()),
    })

    // Process GitHub Push-to-XP pipeline
    // This handles: XP accumulation, badge unlocking, level progression, leaderboard updates, and real-time notifications
    if (xpReward > 0) {
      await githubPushToXpService.processPushAndAwardXP(
        submission.studentId,
        submissionId,
        xpReward
      )
    }

    return finalSubmission
  }

  /**
   * Auto-grade submission based on GitHub push data
   */
  private async autoGradeSubmission(
    payload: GitHubPushPayload,
    assignment: Assignment,
    submission: AssignmentSubmission
  ): Promise<AutoGradeResult> {
    const breakdown = {
      commitMessageQuality: 0,
      commitCount: 0,
      linesBalance: 0,
      requiredFilesPresent: 0,
      folderStructure: 0,
      readmeQuality: 0,
    }

    const details: string[] = []

    // 1. Commit message quality (10 points)
    breakdown.commitMessageQuality = this.gradeCommitMessageQuality(payload.commits)
    if (breakdown.commitMessageQuality > 0) {
      details.push(`✓ Commit message quality: ${breakdown.commitMessageQuality}/10`)
    }

    // 2. Number of commits (10 points)
    breakdown.commitCount = this.gradeCommitCount(payload.commits)
    if (breakdown.commitCount > 0) {
      details.push(`✓ Commit count: ${breakdown.commitCount}/10 (${payload.commits.length} commits)`)
    }

    // 3. Lines added/removed balance (15 points)
    breakdown.linesBalance = this.gradeLinesBalance(payload.commits)
    if (breakdown.linesBalance > 0) {
      details.push(`✓ Lines balance: ${breakdown.linesBalance}/15`)
    }

    // 4. Required files present (20 points)
    breakdown.requiredFilesPresent = this.gradeRequiredFiles(payload, assignment.requiredFiles)
    if (breakdown.requiredFilesPresent > 0) {
      details.push(`✓ Required files: ${breakdown.requiredFilesPresent}/20`)
    }

    // 5. Folder structure correctness (25 points)
    breakdown.folderStructure = this.gradeFolderStructure(payload, assignment.expectedFolderStructure)
    if (breakdown.folderStructure > 0) {
      details.push(`✓ Folder structure: ${breakdown.folderStructure}/25`)
    }

    // 6. README quality (20 points)
    breakdown.readmeQuality = this.gradeReadmeQuality(payload)
    if (breakdown.readmeQuality > 0) {
      details.push(`✓ README quality: ${breakdown.readmeQuality}/20`)
    }

    // Calculate total score
    const score =
      breakdown.commitMessageQuality +
      breakdown.commitCount +
      breakdown.linesBalance +
      breakdown.requiredFilesPresent +
      breakdown.folderStructure +
      breakdown.readmeQuality

    // Determine status
    let status: 'PASS' | 'REVIEW' | 'FAIL'
    if (score >= 80) {
      status = 'PASS'
      details.push(`✓ Status: PASS (${score}/100)`)
    } else if (score >= 50) {
      status = 'REVIEW'
      details.push(`⚠ Status: REVIEW (${score}/100)`)
    } else {
      status = 'FAIL'
      details.push(`✗ Status: FAIL (${score}/100)`)
    }

    return {
      score,
      breakdown,
      status,
      details,
    }
  }

  /**
   * Grade commit message quality (0-10 points)
   */
  private gradeCommitMessageQuality(commits: GitHubPushPayload['commits']): number {
    if (commits.length === 0) return 0

    let qualityScore = 0
    const goodMessages = commits.filter((c) => {
      const msg = c.message.toLowerCase()
      // Check for descriptive messages (not just "update", "fix", etc.)
      return msg.length > 10 && !msg.match(/^(update|fix|change|modify)$/i)
    }).length

    // Award points based on percentage of good messages
    const percentage = goodMessages / commits.length
    if (percentage >= 0.8) qualityScore = 10
    else if (percentage >= 0.6) qualityScore = 7
    else if (percentage >= 0.4) qualityScore = 4
    else if (percentage > 0) qualityScore = 2

    return qualityScore
  }

  /**
   * Grade commit count (0-10 points)
   */
  private gradeCommitCount(commits: GitHubPushPayload['commits']): number {
    const count = commits.length

    if (count >= 5) return 10
    if (count >= 3) return 7
    if (count >= 1) return 4
    return 0
  }

  /**
   * Grade lines added/removed balance (0-15 points)
   */
  private gradeLinesBalance(commits: GitHubPushPayload['commits']): number {
    let totalAdded = 0
    let totalRemoved = 0

    commits.forEach((c) => {
      totalAdded += c.added.length
      totalRemoved += c.removed.length
    })

    // Prefer balanced changes (not just adding or removing)
    const total = totalAdded + totalRemoved
    if (total === 0) return 0

    const ratio = Math.min(totalAdded, totalRemoved) / Math.max(totalAdded, totalRemoved)

    if (ratio >= 0.5) return 15 // Well balanced
    if (ratio >= 0.3) return 10 // Somewhat balanced
    if (ratio >= 0.1) return 5 // Mostly one-sided
    return 2 // Very one-sided but has some balance
  }

  /**
   * Grade required files presence (0-20 points)
   */
  private gradeRequiredFiles(payload: GitHubPushPayload, requiredFiles: string[]): number {
    if (requiredFiles.length === 0) return 20

    const allChangedFiles = new Set<string>()
    payload.commits.forEach((c) => {
      c.added.forEach((f) => allChangedFiles.add(f))
      c.modified.forEach((f) => allChangedFiles.add(f))
    })

    const presentFiles = requiredFiles.filter((rf) => {
      return Array.from(allChangedFiles).some((f) => f.includes(rf) || rf.includes(f))
    }).length

    const percentage = presentFiles / requiredFiles.length
    if (percentage === 1) return 20
    if (percentage >= 0.8) return 15
    if (percentage >= 0.6) return 10
    if (percentage >= 0.4) return 5
    if (percentage > 0) return 2
    return 0
  }

  /**
   * Grade folder structure correctness (0-25 points)
   */
  private gradeFolderStructure(payload: GitHubPushPayload, expectedStructure?: string): number {
    if (!expectedStructure) return 25 // No specific structure required

    const allChangedFiles = new Set<string>()
    payload.commits.forEach((c) => {
      c.added.forEach((f) => allChangedFiles.add(f))
      c.modified.forEach((f) => allChangedFiles.add(f))
    })

    // Parse expected structure (e.g., "src/", "tests/", "docs/")
    const expectedFolders = expectedStructure
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (expectedFolders.length === 0) return 25

    const presentFolders = expectedFolders.filter((ef) => {
      return Array.from(allChangedFiles).some((f) => f.startsWith(ef))
    }).length

    const percentage = presentFolders / expectedFolders.length
    if (percentage === 1) return 25
    if (percentage >= 0.8) return 20
    if (percentage >= 0.6) return 15
    if (percentage >= 0.4) return 10
    if (percentage > 0) return 5
    return 0
  }

  /**
   * Grade README quality (0-20 points)
   */
  private gradeReadmeQuality(payload: GitHubPushPayload): number {
    const allChangedFiles = new Set<string>()
    payload.commits.forEach((c) => {
      c.added.forEach((f) => allChangedFiles.add(f))
      c.modified.forEach((f) => allChangedFiles.add(f))
    })

    // Check if README exists or was modified
    const hasReadme = Array.from(allChangedFiles).some((f) => f.toLowerCase().includes('readme'))

    if (!hasReadme) return 0

    // Check commit messages for README-related changes
    const readmeCommits = payload.commits.filter((c) => c.message.toLowerCase().includes('readme'))

    if (readmeCommits.length > 0) return 20 // README was explicitly updated
    return 10 // README exists but wasn't explicitly mentioned
  }
}

// Create singleton instance with webhook secret from environment
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret'
const githubWebhookService = new GitHubWebhookService(webhookSecret)

export { GitHubWebhookService, githubWebhookService }
export default githubWebhookService
