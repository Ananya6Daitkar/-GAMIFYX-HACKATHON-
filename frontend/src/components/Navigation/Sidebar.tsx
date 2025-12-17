import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface NavLink {
  label: string
  href: string
  icon?: string
}

interface SidebarProps {
  links: NavLink[]
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  links,
  isOpen = true,
  onClose,
}) => {
  const prefersReducedMotion = useReducedMotion()

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
      className="h-full w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-cyan-500/20 backdrop-blur-md overflow-y-auto"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <div className="p-6 border-b border-cyan-500/10">
        <h1 className="text-2xl font-bold text-cyan-400 font-orbitron">
          GamifyX
        </h1>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {links.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
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
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-cyan-400 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-cyan-400 hover:bg-cyan-500/10 group focus:outline-none focus:bg-cyan-500/10 focus:text-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400"
              aria-label={link.label}
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                {link.icon}
              </span>
              <span className="font-medium">{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>
    </motion.div>
  )
}
