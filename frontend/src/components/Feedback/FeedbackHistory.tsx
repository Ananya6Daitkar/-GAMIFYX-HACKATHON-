import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react'

interface FeedbackItem {
  id: string
  category: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: string
  updatedAt: string
  auditTrail?: Array<{
    timestamp: string
    action: string
    actor: string
    details?: string
  }>
}

const mockFeedbackItems: FeedbackItem[] = [
  {
    id: '1',
    category: 'technical',
    subject: 'Dashboard loading issue',
    message: 'The dashboard takes too long to load sometimes. It would be great if it could be optimized.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Feedback submitted',
        actor: 'You',
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Status changed',
        actor: 'Support Team',
        details: 'in_progress',
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Status changed',
        actor: 'Support Team',
        details: 'resolved',
      },
    ],
  },
  {
    id: '2',
    category: 'assignment',
    subject: 'Assignment deadline extension',
    message: 'Could we get an extension on the current assignment? I have been busy with other coursework.',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Feedback submitted',
        actor: 'You',
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Status changed',
        actor: 'Support Team',
        details: 'in_progress',
      },
    ],
  },
  {
    id: '3',
    category: 'general',
    subject: 'Feature request: Dark mode',
    message: 'Would love to see a dark mode option for the platform. The current theme is great but a dark mode would be easier on the eyes.',
    status: 'open',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const FeedbackHistory: React.FC = () => {
  const [feedback] = useState<FeedbackItem[]>(mockFeedbackItems)
  const [loading] = useState(false)
  const [error] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/10 border-green-500/30 text-green-300'
      case 'in_progress':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-red-300">{error}</p>
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No feedback submissions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <div
          key={item.id}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition"
        >
          <button
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="w-full p-4 flex items-start justify-between hover:bg-slate-800/50 transition text-left"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(item.status)}
                <h3 className="font-semibold text-white">{item.subject}</h3>
              </div>
              <p className="text-sm text-gray-400">
                Category: <span className="text-cyan-400">{item.category}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
              {item.status.replace('_', ' ').toUpperCase()}
            </div>
          </button>

          {expandedId === item.id && (
            <div className="border-t border-cyan-500/20 p-4 bg-slate-800/30">
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-2">Message:</p>
                <p className="text-gray-400 text-sm whitespace-pre-wrap">{item.message}</p>
              </div>

              {item.auditTrail && item.auditTrail.length > 0 && (
                <div>
                  <p className="text-sm text-gray-300 mb-2">Activity:</p>
                  <div className="space-y-2">
                    {item.auditTrail.map((entry, idx) => (
                      <div key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                        <span className="text-cyan-400 flex-shrink-0">•</span>
                        <span>
                          {new Date(entry.timestamp).toLocaleString()} - {entry.action}
                          {entry.details && `: ${entry.details}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default FeedbackHistory
