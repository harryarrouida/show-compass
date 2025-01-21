import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#111111',
          secondary: '#161616',
          tertiary: '#1E1E2A',
        },
        accent: {
          primary: '#818cf8',
          secondary: '#6366f1',
          hover: '#a5b4fc',
        },
        interactive: {
          button: {
            primary: '#4f46e5',
            primaryHover: '#4338ca',
            ghost: 'rgba(99, 102, 241, 0.1)',
            ghostHover: 'rgba(99, 102, 241, 0.2)',
          },
          input: {
            background: 'rgba(17, 17, 17, 0.6)',
            border: 'rgba(99, 102, 241, 0.2)',
            focusBorder: 'rgba(99, 102, 241, 0.5)',
          },
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          tertiary: '#64748b',
          accent: '#818cf8',
        },
        status: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
        border: {
          primary: 'rgb(39 39 42 / 0.5)', // zinc-800/50
          secondary: 'rgba(148, 163, 184, 0.1)',
          hover: 'rgba(99, 102, 241, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'lg': '0.75rem',
      },
      transitionDuration: {
        DEFAULT: '300ms'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale': 'scale 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.1))',
        'gradient-accent': 'linear-gradient(to right, #4f46e5, #818cf8)',
        'gradient-glow': 'linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.2))',
      }
    },
  },
  plugins: [
    typography,
  ],
} satisfies Config;
