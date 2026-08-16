// qams-web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand Colors — QAMS Design System
        qams: {
          primary:   '#4F46E5', // Indigo-600 — Acciones principales, navegación
          secondary: '#10B981', // Emerald-500 — Estado Pasó, indicadores saludables
          accent:    '#F59E0B', // Amber-400  — Pendiente, en progreso, advertencia
          danger:    '#F43F5E', // Rose-500   — Fallido, crítico, bugs
          violet:    '#7C3AED', // Violet-600 — Automatización, scripts
        },
        // Paleta primary (mantenida por compatibilidad)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
          DEFAULT: '#1e293b',
          hover: '#334155',
          active: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'qams-hero':    'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)',
        'qams-primary': 'linear-gradient(135deg, #6366f1 0%, #4F46E5 100%)',
        'qams-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      keyframes: {
        'stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        'stagger-in': 'stagger-in 0.5s ease both',
        'sparkle': 'sparkle 2s ease infinite',
      },
    },
  },
  plugins: [],
};
