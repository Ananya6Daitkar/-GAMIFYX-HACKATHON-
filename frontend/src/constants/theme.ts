// Dark mode colors
const darkColors = {
  primary: '#00FFFF', // Cyan
  secondary: '#FF00FF', // Magenta
  accent: '#0099FF', // Blue
  background: '#0a0e27', // Very dark blue
  surface: '#1a1a3e', // Dark slate
  surfaceLight: '#2d2d5f', // Lighter surface
  text: '#ffffff',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#334155',
  borderLight: '#475569',
}

// Light mode colors
const lightColors = {
  primary: '#0099FF', // Blue (adjusted for light mode)
  secondary: '#FF00FF', // Magenta
  accent: '#00FFFF', // Cyan
  background: '#f8fafc', // Very light
  surface: '#f1f5f9', // Light slate
  surfaceLight: '#e2e8f0', // Lighter surface
  text: '#0f172a', // Dark text
  textSecondary: '#475569',
  textTertiary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  border: '#cbd5e1',
  borderLight: '#e2e8f0',
}

export const THEME = {
  dark: darkColors,
  light: lightColors,
  colors: darkColors, // Default to dark
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  breakpoints: {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    wide: 1920,
  },
  effects: {
    glassBlur: '10px',
    glassOpacity: 0.8,
    neonGlowIntensity: 0.5,
  },
}

export const ANIMATION_DELAYS = {
  staggerCard: 100, // ms between each card
  pageTransition: 300,
  elementEntrance: 500,
}

// CSS class utilities for design system
export const DESIGN_SYSTEM = {
  // Glass morphism effect
  glass: 'bg-white/10 backdrop-blur-[10px] border border-white/20',
  glassDark: 'bg-slate-900/40 backdrop-blur-[10px] border border-slate-700/50',
  glassLight: 'bg-white/80 backdrop-blur-[10px] border border-gray-200/50',

  // Neon glow effects
  glowCyan: 'shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75',
  glowMagenta: 'shadow-lg shadow-magenta-500/50 hover:shadow-magenta-500/75',
  glowBlue: 'shadow-lg shadow-blue-500/50 hover:shadow-blue-500/75',

  // Gradient backgrounds
  gradientDark: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
  gradientDarkBlue: 'bg-gradient-to-br from-slate-900 to-blue-900',
  gradientNeon: 'bg-gradient-to-r from-cyan-500/20 to-magenta-500/20',

  // Smooth transitions
  transitionFast: 'transition-all duration-150',
  transitionNormal: 'transition-all duration-300',
  transitionSlow: 'transition-all duration-500',

  // Typography
  headingXL: 'text-4xl font-bold font-orbitron',
  headingLg: 'text-3xl font-bold font-orbitron',
  headingMd: 'text-2xl font-bold font-orbitron',
  headingSm: 'text-xl font-bold font-orbitron',
  bodyLg: 'text-lg font-inter',
  bodyMd: 'text-base font-inter',
  bodySm: 'text-sm font-inter',
  code: 'font-mono text-sm',

  // Interactive states
  buttonBase: 'px-4 py-2 rounded-lg font-medium transition-all duration-300',
  buttonPrimary: 'bg-cyan-500 hover:bg-cyan-600 text-black font-bold',
  buttonSecondary: 'bg-magenta-500 hover:bg-magenta-600 text-white font-bold',
  buttonGhost: 'bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',

  // Cards and containers
  card: 'rounded-lg border backdrop-blur-md transition-all duration-300',
  cardDark: 'bg-slate-800/80 border-cyan-500/30 hover:border-cyan-500/60',
  cardLight: 'bg-white/90 border-gray-200/50 hover:border-gray-300/75',

  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900',
  focusRingLight: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white',
}

