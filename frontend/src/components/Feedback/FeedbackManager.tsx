import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Loader, MessageSquare } from 'lucide-react'

interface FeedbackItem {
  id: string
  userId: string
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

export const FeedbackManager: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/feedback/assigned/to-me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feedback')
      }

      const data = await response.json()
      setFeedback(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (feedbackId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    try {
      setUpdatingId(feedbackId)
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updated = await response.json()
      setFeedback(feedback.map((f) => (f.id === feedbackId ? updated : f)))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <MessageSquare className="w-5 h-5 text-blue-400" />
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

  const filteredFeedback = feedback.filter((f) => statusFilter === 'all' || f.status === statusFilter)

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

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === status
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border border-slate-700 text-gray-400 hover:border-slate-600'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
            {status !== 'all' && (
              <span className="ml-2 text-xs">
                ({feedback.filter((f) => f.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No feedback to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
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
                <div className="border-t border-cyan-500/20 p-4 bg-slate-800/30 space-y-4">
                  {/* Message */}
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Message:</p>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{item.message}</p>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {(['open', 'in_progress', 'resolved'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(item.id, status)}
                        disabled={updatingId === item.id || item.status === status}
                        className={`px-3 py-1 rounded text-xs font-medium transition ${
                          item.status === status
                            ? 'bg-slate-700 text-gray-400 cursor-default'
                            : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50'
                        }`}
                      >
                        {updatingId === item.id ? (
                          <Loader className="w-3 h-3 inline animate-spin" />
                        ) : (
                          status.replace('_', ' ').toUpperCase()
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Audit Trail */}
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
      )}
    </div>
  )
}

export default FeedbackManager
