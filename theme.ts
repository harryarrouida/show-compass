// Theme Colors Object - You can add this to your Tailwind config
const colors = {
  // Main Background Colors
  background: {
    primary: '#111111',    // Main background
    secondary: '#161616',  // Navbar, cards, containers
    tertiary: '#1E1E2A',  // Elevated components
  },

  // Accent Colors (Indigo-based)
  accent: {
    primary: '#818cf8',    // indigo-400 - Main accent color
    secondary: '#6366f1',  // indigo-500 - Secondary accent
    hover: '#a5b4fc',      // indigo-300 - Hover states
  },

  // Interactive Elements
  interactive: {
    button: {
      primary: '#4f46e5',      // indigo-600 - Primary buttons
      primaryHover: '#4338ca', // indigo-700 - Primary hover
      ghost: 'rgba(99, 102, 241, 0.1)',  // Transparent buttons
      ghostHover: 'rgba(99, 102, 241, 0.2)',
    },
    input: {
      background: 'rgba(17, 17, 17, 0.6)',
      border: 'rgba(99, 102, 241, 0.2)',
      focusBorder: 'rgba(99, 102, 241, 0.5)',
    },
  },

  // Text Colors
  text: {
    primary: '#f1f5f9',    // slate-100 - Main text
    secondary: '#94a3b8',  // slate-400 - Secondary text
    tertiary: '#64748b',   // slate-500 - Subtle text
    accent: '#818cf8',     // indigo-400 - Accented text
  },

  // Status Colors
  status: {
    success: '#10b981',    // emerald-500
    error: '#ef4444',      // red-500
    warning: '#f59e0b',    // amber-500
    info: '#3b82f6',       // blue-500
  },

  // Border Colors
  border: {
    primary: 'rgba(99, 102, 241, 0.1)',
    secondary: 'rgba(148, 163, 184, 0.1)',
    hover: 'rgba(99, 102, 241, 0.2)',
  },

  // Gradient Colors
  gradients: {
    subtle: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.1))',
    accent: 'linear-gradient(to right, #4f46e5, #818cf8)',
    glow: 'linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.2))',
  },
}

// Common Component Styles
const components = {
  // Card Styles
  card: {
    base: 'bg-[#161616] rounded-xl border border-[rgba(99,102,241,0.1)] hover:border-[rgba(99,102,241,0.2)] transition-all duration-300',
    hover: 'hover:shadow-lg hover:shadow-indigo-500/5',
    active: 'bg-[#1E1E2A]',
  },

  // Button Styles
  button: {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-300',
    secondary: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors duration-300',
    ghost: 'hover:bg-indigo-500/10 text-indigo-400 transition-colors duration-300',
  },

  // Input Styles
  input: {
    base: 'bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500/50 transition-all duration-300',
  },

  // Navigation Styles
  nav: {
    link: 'text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors duration-300',
    activePage: 'bg-zinc-800 text-white',
  },

  // Text Gradients
  textGradients: {
    primary: 'bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent',
    subtle: 'bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 bg-clip-text text-transparent',
  },
}

// Animation Definitions
const animations = {
  transition: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },
  hover: {
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-lg hover:shadow-indigo-500/10',
  },
} 