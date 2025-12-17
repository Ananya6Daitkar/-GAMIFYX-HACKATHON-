import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from '../../types/index'

interface EditFormProps {
  user: User
  onSave: (updates: Partial<User>) => Promise<void>
  onCancel: () => void
}

export const EditForm: React.FC<EditFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be at most 20 characters'
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        avatar: 'Only JPG and PNG files are allowed',
      }))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: 'File size must be less than 5MB',
      }))
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.avatar
      return newErrors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      const updates: Partial<User> = {
        username: formData.username,
        email: formData.email,
      }

      // Handle avatar upload if changed
      if (avatarFile) {
        const formDataObj = new FormData()
        formDataObj.append('file', avatarFile)

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/upload/avatar`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formDataObj,
          }
        )

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload avatar')
        }

        const uploadData = await uploadResponse.json()
        updates.avatar = uploadData.url
      }

      await onSave(updates)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err instanceof Error ? err.message : 'Failed to save profile',
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-8 backdrop-blur-md"
    >
      <h2 className="text-2xl font-bold text-white font-orbitron mb-8">
        Edit Profile
      </h2>

      {/* Submit Error */}
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm"
        >
          {errors.submit}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Avatar Upload */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Avatar
          </label>
          <div className="flex gap-6 items-start">
            {/* Preview */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-1 flex-shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-cyan-400">
                  {formData.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload Input */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                JPG or PNG, max 5MB
              </p>
              {errors.avatar && (
                <p className="text-xs text-red-400 mt-1">{errors.avatar}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Username */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
            className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.username
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-cyan-500/20 focus:ring-cyan-500/50'
            }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="text-xs text-red-400 mt-1">{errors.username}</p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.email
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-cyan-500/20 focus:ring-cyan-500/50'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email}</p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/20"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-slate-700/50 border border-gray-500/30 text-gray-300 font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Cancel
          </motion.button>
        </motion.div>
      </div>
    </motion.form>
  )
}
