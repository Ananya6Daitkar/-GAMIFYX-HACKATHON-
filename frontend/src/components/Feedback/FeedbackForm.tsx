import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Loader, X } from 'lucide-react'

interface FeedbackFormProps {
  onSuccess?: (ticketNumber: string) => void
  onClose?: () => void
  isOpen?: boolean
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, onClose, isOpen = true }) => {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  const handleClose = () => {
    // Reset form state
    setCategory('')
    setSubject('')
    setMessage('')
    setAttachments([])
    setError('')
    setSuccess(false)
    setTicketNumber('')
    
    if (onClose) {
      onClose()
    }
  }

  const categories = ['technical', 'assignment', 'general', 'other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      if (!category) {
        throw new Error('Please select a category')
      }
      if (!subject || subject.length < 3) {
        throw new Error('Subject must be at least 3 characters')
      }
      if (!message || message.length < 10) {
        throw new Error('Message must be at least 10 characters')
      }

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock ticket number
      const mockTicketNumber = `TKT-${Date.now()}`
      setTicketNumber(mockTicketNumber)
      setSuccess(true)

      // Reset form
      setCategory('')
      setSubject('')
      setMessage('')
      setAttachments([])

      // Call success callback
      if (onSuccess) {
        onSuccess(mockTicketNumber)
      }

      // Auto-close after 5 seconds
      setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 max-w-md w-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-4">Feedback Submitted!</h2>
          <p className="text-gray-300 text-center mb-6">
            Thank you for your feedback. We'll review it shortly.
          </p>
          <div className="bg-slate-800/50 rounded p-4 mb-6 border border-cyan-500/20">
            <p className="text-gray-400 text-sm mb-2">Your ticket number:</p>
            <p className="text-cyan-400 font-mono text-lg font-bold">{ticketNumber}</p>
          </div>
          <p className="text-gray-400 text-sm text-center mb-6">
            You can use this ticket number to track your feedback.
          </p>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 max-w-2xl w-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Send us your feedback</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject of your feedback"
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              disabled={loading}
              maxLength={255}
            />
            <p className="text-xs text-gray-500 mt-1">{subject.length}/255</p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide detailed feedback or describe the issue you're experiencing"
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition resize-none"
              rows={6}
              disabled={loading}
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/5000</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackForm
