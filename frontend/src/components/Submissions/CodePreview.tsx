import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface CodePreviewProps {
  code: string
  language: string
}

// Simple syntax highlighting for common languages
const highlightCode = (code: string, language: string): string => {
  // This is a simplified version - in production, use a library like highlight.js
  let highlighted = code

  // Escape HTML
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Basic keyword highlighting
  const keywords = [
    'function',
    'const',
    'let',
    'var',
    'return',
    'if',
    'else',
    'for',
    'while',
    'class',
    'import',
    'export',
    'async',
    'await',
    'try',
    'catch',
    'throw',
    'new',
    'this',
    'super',
    'extends',
    'implements',
    'interface',
    'type',
    'enum',
    'namespace',
    'module',
    'public',
    'private',
    'protected',
    'static',
    'readonly',
    'abstract',
    'default',
    'case',
    'switch',
    'break',
    'continue',
    'do',
  ]

  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
    highlighted = highlighted.replace(
      regex,
      `<span class="text-magenta-400">${keyword}</span>`
    )
  })

  // String highlighting
  highlighted = highlighted.replace(
    /(['"`])([^'"]*)\1/g,
    '<span class="text-green-400">$1$2$1</span>'
  )

  // Comment highlighting
  highlighted = highlighted.replace(
    /\/\/.*$/gm,
    '<span class="text-gray-500">$&</span>'
  )
  highlighted = highlighted.replace(
    /\/\*[\s\S]*?\*\//g,
    '<span class="text-gray-500">$&</span>'
  )

  // Number highlighting
  highlighted = highlighted.replace(
    /\b(\d+)\b/g,
    '<span class="text-cyan-400">$1</span>'
  )

  return highlighted
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language,
}) => {
  const lines = code.split('\n')
  const maxLines = 20
  const isLongCode = lines.length > maxLines
  const displayLines = isLongCode ? lines.slice(0, maxLines) : lines

  const highlightedCode = useMemo(
    () => highlightCode(code, language),
    [code, language]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-slate-800/50 px-4 py-2 border-b border-cyan-500/10 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
          {language}
        </span>
        <span className="text-xs text-gray-500">
          {lines.length} lines
        </span>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-sm text-gray-300 leading-relaxed">
          {displayLines.map((line, index) => (
            <div key={index} className="flex">
              <span className="inline-block w-8 text-right pr-4 text-gray-600 select-none">
                {index + 1}
              </span>
              <code
                dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                className="flex-1"
              />
            </div>
          ))}
        </pre>
      </div>

      {/* Truncation notice */}
      {isLongCode && (
        <div className="bg-slate-800/30 px-4 py-2 border-t border-cyan-500/10 text-center text-xs text-gray-500">
          ... and {lines.length - maxLines} more lines
        </div>
      )}
    </motion.div>
  )
}
