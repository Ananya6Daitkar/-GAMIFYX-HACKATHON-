import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Search, ChevronDown } from 'lucide-react'

interface NavLink {
  label: string
  href: string
  icon?: string
}

interface NavSection {
  title: string
  icon?: string
  links: NavLink[]
}

interface SidebarProps {
  links: NavLink[]
  isOpen?: boolean
  onClose?: () => void
}

// Group links into sections
const groupLinks = (links: NavLink[]): NavSection[] => {
  const sections: { [key: string]: NavSection } = {
    'Learning': {
      title: 'Learning',
      icon: '📚',
      links: links.filter(l => ['Dashboard', 'Assignments', 'Submissions', 'Focus Lock'].includes(l.label))
    },
    'Progress': {
      title: 'Progress',
      icon: '📈',
      links: links.filter(l => ['Leaderboard', 'Achievements', 'Analytics', 'Feedback'].includes(l.label))
    },
    'Advanced': {
      title: 'Advanced',
      icon: '🚀',
      links: links.filter(l => ['DevOps', 'AIOps'].includes(l.label))
    },
    'Management': {
      title: 'Management',
      icon: '👨‍🏫',
      links: links.filter(l => ['Teacher Dashboard'].includes(l.label))
    },
    'Other': {
      title: 'Other',
      icon: '⚙️',
      links: links.filter(l => ['Notifications', 'Profile'].includes(l.label))
    }
  }

  return Object.values(sections).filter(s => s.links.length > 0)
}

export const Sidebar: React.FC<SidebarProps> = ({
  links,
  isOpen = true,
  onClose,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>(['Learning', 'Progress', 'Advanced'])

  const sections = useMemo(() => groupLinks(links), [links])

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections

    return sections
      .map(section => ({
        ...section,
        links: section.links.filter(link =>
          link.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(section => section.links.length > 0)
  }, [sections, searchQuery])

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    )
  }

  const handleNavClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3 }
      }
      className="h-full w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-cyan-500/20 backdrop-blur-md overflow-y-auto flex flex-col"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Header - Just spacing */}
      <div className="p-3 flex-shrink-0" />

      {/* Search Bar */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            aria-label="Search navigation"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        <AnimatePresence>
          {filteredSections.map((section) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors duration-200"
                aria-expanded={expandedSections.includes(section.title)}
              >
                <span className="flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.title}
                </span>
                <motion.div
                  animate={{
                    rotate: expandedSections.includes(section.title) ? 180 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Section Links */}
              <AnimatePresence>
                {expandedSections.includes(section.title) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 ml-2"
                  >
                    {section.links.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { delay: index * 0.05 }
                        }
                      >
                        <Link
                          to={link.href}
                          onClick={handleNavClick}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-cyan-400 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-cyan-400 hover:bg-cyan-500/10 group focus:outline-none focus:bg-cyan-500/10 focus:text-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400"
                          aria-label={link.label}
                        >
                          <span className="text-base group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                            {link.icon}
                          </span>
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* No Results */}
        {filteredSections.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500 text-sm"
          >
            No results for "{searchQuery}"
          </motion.div>
        )}
      </nav>
    </motion.div>
  )
}
