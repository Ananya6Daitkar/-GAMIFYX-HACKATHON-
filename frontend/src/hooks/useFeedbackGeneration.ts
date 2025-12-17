import { useState, useCallback } from 'react'
import { AIFeedback } from '../types'
import { api } from '../utils/api'

interface UseFeedbackGenerationResult {
  feedback: AIFeedback | null
  loading: boolean
  error: string | null
  generateFeedback: (submissionId: string) => Promise<AIFeedback | null>
}

/**
 * Hook to generate and manage AI feedback for submissions
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
export const useFeedbackGeneration = (): UseFeedbackGenerationResult => {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateFeedback = useCallback(
    async (submissionId: string): Promise<AIFeedback | null> => {
      try {
        setLoading(true)
        setError(null)

        // Call the API to generate feedback
        const result = await api.post(`/submissions/${submissionId}/feedback`, {})
        setFeedback(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate feedback'
        setError(errorMessage)
        console.error('Error generating feedback:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    feedback,
    loading,
    error,
    generateFeedback,
  }
}
