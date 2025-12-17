import { AIFeedback, CodeReference, Assignment, AssignmentSubmission } from '../database/models'
import aiFeedbackRepository from '../database/repositories/aiFeedbackRepository'
import submissionRepository from '../database/repositories/submissionRepository'
import assignmentRepository from '../database/repositories/assignmentRepository'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'

interface OllamaResponse {
  response: string
  done: boolean
}

interface FeedbackGenerationResult {
  insights: string[]
  confidenceScore: number
  codeReferences: CodeReference[]
}

interface GitHubContextData {
  gitDiff: string
  scoreBreakdown: {
    commitMessageQuality: number
    commitCount: number
    linesBalance: number
    requiredFilesPresent: number
    folderStructure: number
    readmeQuality: number
  }
  totalScore: number
  commitMessages: string[]
}

export class AIFeedbackService {
  private ollamaBaseUrl: string
  private model: string = 'mistral'
  private ollamaTimeout: number = 10000 // 10 seconds timeout

  constructor() {
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    this.ollamaTimeout = parseInt(process.env.OLLAMA_TIMEOUT || '10000', 10)
  }

  /**
   * Generate AI feedback for a code submission
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
   */
  async generateFeedback(submissionId: string): Promise<AIFeedback> {
    try {
      // Fetch submission
      const submission = await submissionRepository.findById(submissionId)
      if (!submission) {
        throw new Error(`Submission ${submissionId} not found`)
      }

      // Check if feedback already exists
      const existingFeedback = await aiFeedbackRepository.findBySubmissionId(submissionId)
      if (existingFeedback) {
        return existingFeedback
      }

      // Generate feedback using Ollama
      const feedbackResult = await this.callOllama(submission.code, submission.language)

      // Parse and structure the feedback
      const { insights, confidenceScore, codeReferences } = this.parseFeedback(
        feedbackResult,
        submission.code
      )

      // Store feedback in database
      const feedback = await aiFeedbackRepository.create({
        submissionId,
        insights,
        confidenceScore,
        codeReferences,
      })

      return feedback
    } catch (error) {
      console.error('Error generating AI feedback:', error)
      throw error
    }
  }

  /**
   * Generate AI feedback for a GitHub assignment submission with full context
   * Requirement 6.1, 6.2, 6.3, 6.4, 6.5: Local LLM integration with context-aware feedback
   */
  async generateGitHubAssignmentFeedback(
    assignmentSubmissionId: string,
    githubContext: GitHubContextData
  ): Promise<AIFeedback> {
    try {
      // Fetch assignment submission
      const submission = await assignmentSubmissionRepository.findById(assignmentSubmissionId)
      if (!submission) {
        throw new Error(`Assignment submission ${assignmentSubmissionId} not found`)
      }

      // Check if feedback already exists
      const existingFeedback = await aiFeedbackRepository.findBySubmissionId(assignmentSubmissionId)
      if (existingFeedback) {
        return existingFeedback
      }

      // Fetch assignment for context
      const assignment = await assignmentRepository.findById(submission.assignmentId)
      if (!assignment) {
        throw new Error(`Assignment ${submission.assignmentId} not found`)
      }

      // Generate feedback using Ollama with GitHub context
      const feedbackResult = await this.callOllamaWithContext(
        githubContext,
        assignment
      )

      // Parse and structure the feedback
      const { insights, confidenceScore, codeReferences } = this.parseFeedback(
        feedbackResult,
        githubContext.gitDiff
      )

      // Store feedback in database
      const feedback = await aiFeedbackRepository.create({
        submissionId: assignmentSubmissionId,
        insights,
        confidenceScore,
        codeReferences,
      })

      return feedback
    } catch (error) {
      console.error('Error generating GitHub assignment feedback:', error)
      throw error
    }
  }

  /**
   * Call Ollama API to generate feedback
   * Requirement 6.5: Use local LLM (Mistral 7B via Ollama)
   * Handles timeout gracefully (>10s = partial feedback with low confidence)
   */
  private async callOllama(code: string, language: string): Promise<string> {
    try {
      const prompt = this.buildPrompt(code, language)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.ollamaTimeout)

      try {
        const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt,
            stream: false,
            temperature: 0.7,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`)
        }

        const data = (await response.json()) as OllamaResponse
        return data.response
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Ollama request timeout (>10s), using fallback feedback')
          return this.generateFallbackFeedback(code, language)
        }
        throw error
      }
    } catch (error) {
      console.error('Error calling Ollama:', error)
      // Return fallback feedback if Ollama fails
      return this.generateFallbackFeedback(code, language)
    }
  }

  /**
   * Call Ollama API with GitHub context for assignment feedback
   * Requirement 6.1, 6.2, 6.3: Context-aware feedback with confidence scoring
   * Handles timeout gracefully (>10s = partial feedback with low confidence)
   */
  private async callOllamaWithContext(
    githubContext: GitHubContextData,
    assignment: Assignment
  ): Promise<string> {
    try {
      const prompt = this.buildContextualPrompt(githubContext, assignment)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.ollamaTimeout)

      try {
        const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt,
            stream: false,
            temperature: 0.7,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`)
        }

        const data = (await response.json()) as OllamaResponse
        return data.response
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Ollama request timeout (>10s), using fallback feedback with low confidence')
          return this.generateFallbackFeedbackWithContext(githubContext)
        }
        throw error
      }
    } catch (error) {
      console.error('Error calling Ollama with context:', error)
      // Return fallback feedback if Ollama fails
      return this.generateFallbackFeedbackWithContext(githubContext)
    }
  }

  /**
   * Build a structured prompt for code analysis
   */
  private buildPrompt(code: string, language: string): string {
    return `You are an expert code reviewer. Analyze the following ${language} code and provide constructive feedback.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide feedback in the following JSON format:
{
  "insights": ["insight1", "insight2", "insight3"],
  "confidence": 85,
  "codeReferences": [
    {"lineNumber": 1, "snippet": "code snippet", "suggestion": "suggestion"}
  ]
}

Focus on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance improvements
4. Readability and maintainability

Respond ONLY with valid JSON.`
  }

  /**
   * Build a contextual prompt for GitHub assignment feedback
   * Requirement 6.1, 6.2, 6.3: Include git diff, score breakdown, and assignment requirements
   */
  private buildContextualPrompt(githubContext: GitHubContextData, assignment: Assignment): string {
    const scoreBreakdown = githubContext.scoreBreakdown
    const scoreDetails = `
Commit Message Quality: ${scoreBreakdown.commitMessageQuality}/10
Commit Count: ${scoreBreakdown.commitCount}/10
Lines Balance: ${scoreBreakdown.linesBalance}/15
Required Files: ${scoreBreakdown.requiredFilesPresent}/20
Folder Structure: ${scoreBreakdown.folderStructure}/25
README Quality: ${scoreBreakdown.readmeQuality}/20
Total Score: ${githubContext.totalScore}/100`

    const commitMessages = githubContext.commitMessages
      .slice(0, 5)
      .map((msg, i) => `${i + 1}. ${msg}`)
      .join('\n')

    return `You are an expert code reviewer evaluating a GitHub assignment submission.

ASSIGNMENT REQUIREMENTS:
Title: ${assignment.title}
Description: ${assignment.description}
Difficulty: ${assignment.difficulty}
Required Files: ${assignment.requiredFiles.join(', ')}
Expected Folder Structure: ${assignment.expectedFolderStructure || 'Not specified'}

AUTO-GRADING BREAKDOWN:
${scoreDetails}

RECENT COMMIT MESSAGES:
${commitMessages}

GIT DIFF (Changes made):
\`\`\`diff
${githubContext.gitDiff.substring(0, 2000)}
\`\`\`

Provide constructive feedback in the following JSON format:
{
  "insights": [
    "Strength 1: ...",
    "Issue 1: ...",
    "Suggestion 1: ..."
  ],
  "confidence": 85,
  "codeReferences": [
    {"lineNumber": 1, "snippet": "code snippet", "suggestion": "specific improvement"}
  ]
}

Focus on:
1. How well the submission meets assignment requirements
2. Code quality and best practices
3. Specific issues found in the diff
4. Actionable suggestions for improvement
5. Positive aspects to encourage the student

Respond ONLY with valid JSON.`
  }

  /**
   * Parse Ollama response and extract structured feedback
   * Requirement 6.2: Add confidence scoring to responses (0-100%)
   */
  private parseFeedback(response: string, code: string): FeedbackGenerationResult {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.generateFallbackFeedback(code, 'unknown')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate confidence score is between 0-100
      let confidenceScore = parsed.confidence || 75
      if (confidenceScore < 0) confidenceScore = 0
      if (confidenceScore > 100) confidenceScore = 100

      // Ensure insights is an array
      const insights = Array.isArray(parsed.insights) ? parsed.insights : []

      // Ensure code references is an array
      const codeReferences = Array.isArray(parsed.codeReferences)
        ? parsed.codeReferences.map((ref: any) => ({
            lineNumber: ref.lineNumber || 0,
            snippet: ref.snippet || '',
            suggestion: ref.suggestion || '',
          }))
        : []

      return {
        insights,
        confidenceScore,
        codeReferences,
      }
    } catch (error) {
      console.error('Error parsing feedback:', error)
      return this.generateFallbackFeedback(code, 'unknown')
    }
  }

  /**
   * Generate fallback feedback when Ollama is unavailable
   */
  private generateFallbackFeedback(code: string, language: string): FeedbackGenerationResult {
    const insights = [
      'Code structure looks reasonable',
      'Consider adding comments for complex logic',
      'Ensure proper error handling is in place',
    ]

    // Low confidence score for fallback feedback
    const confidenceScore = 30

    const codeReferences: CodeReference[] = []

    return {
      insights,
      confidenceScore,
      codeReferences,
    }
  }

  /**
   * Generate fallback feedback with GitHub context when Ollama is unavailable or times out
   * Requirement: Handle LLM timeout gracefully (>10s = partial feedback with low confidence)
   */
  private generateFallbackFeedbackWithContext(githubContext: GitHubContextData): FeedbackGenerationResult {
    const insights: string[] = []
    const scoreBreakdown = githubContext.scoreBreakdown

    // Generate insights based on auto-grading breakdown
    if (scoreBreakdown.commitMessageQuality < 5) {
      insights.push('Improve commit message quality - use descriptive messages that explain the "why"')
    } else {
      insights.push('Good commit message quality - messages are descriptive and clear')
    }

    if (scoreBreakdown.commitCount < 3) {
      insights.push('Consider making more frequent commits to show incremental progress')
    } else {
      insights.push('Good commit frequency - shows incremental development')
    }

    if (scoreBreakdown.linesBalance < 10) {
      insights.push('Try to balance additions and removals - avoid large one-sided changes')
    }

    if (scoreBreakdown.requiredFilesPresent < 15) {
      insights.push('Ensure all required files are present and modified as needed')
    }

    if (scoreBreakdown.folderStructure < 15) {
      insights.push('Review the expected folder structure and organize files accordingly')
    }

    if (scoreBreakdown.readmeQuality < 10) {
      insights.push('Add or improve the README with clear documentation')
    }

    if (insights.length === 0) {
      insights.push('Submission looks good overall - keep up the quality')
    }

    // Very low confidence score for timeout/fallback feedback
    const confidenceScore = 25

    const codeReferences: CodeReference[] = []

    return {
      insights,
      confidenceScore,
      codeReferences,
    }
  }

  /**
   * Get feedback for a submission
   */
  async getFeedback(submissionId: string): Promise<AIFeedback | null> {
    return aiFeedbackRepository.findBySubmissionId(submissionId)
  }

  /**
   * Get all feedback
   */
  async getAllFeedback(): Promise<AIFeedback[]> {
    return aiFeedbackRepository.getAll()
  }
}

export default new AIFeedbackService()
