/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LlamaIndex Color Palette
        'llama-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B35', // Primary orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'llama-coral': {
          400: '#FF8E72',
          500: '#FF7F5C',
          600: '#FF6B47',
        },
        'llama-magenta': {
          400: '#E879F9',
          500: '#E040FB',
          600: '#C026D3',
        },
        'llama-cyan': {
          400: '#22D3EE',
          500: '#00D9FF',
          600: '#0891B2',
        },
        // Keep existing for backwards compatibility
        'llama-indigo': {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        'llama-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Semantic Tokens - Updated for LlamaIndex style
        brand: {
          primary: '#000000', // Black for primary actions
          secondary: '#FF6B35', // Orange accent
          accent: '#E040FB', // Magenta accent
          dark: '#1a1a1a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'flow-down': 'flowDown 1.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'line-draw': 'lineDraw 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flowDown: {
          '0%': { transform: 'translateY(-5px)', opacity: '0.5' },
          '50%': { transform: 'translateY(5px)', opacity: '1' },
          '100%': { transform: 'translateY(-5px)', opacity: '0.5' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(224, 64, 251, 0.5)' },
        },
        lineDraw: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 50%, #FCE7F3 100%)',
        'llama-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF8E72 25%, #E040FB 50%, #A855F7 75%, #00D9FF 100%)',
        'llama-gradient-subtle': 'linear-gradient(180deg, rgba(255,107,53,0.1) 0%, rgba(224,64,251,0.1) 50%, rgba(0,217,255,0.1) 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
        'workflow-gradient': 'linear-gradient(180deg, #FCE7F3 0%, #E0E7FF 50%, #CFFAFE 100%)',
      },
    },
  },
  plugins: [],
}

