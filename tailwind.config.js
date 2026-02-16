// qams-web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Escanear todos los archivos HTML y TypeScript del proyecto
  content: ["./src/**/*.{html,ts}"],
  // Habilitar modo oscuro por clase CSS
  darkMode: "class",
  theme: {
    extend: {
      // Paleta de colores personalizada para QAMS
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        sidebar: {
          DEFAULT: "#1e293b",
          hover: "#334155",
          active: "#0f172a",
        },
      },
      // Fuentes del sistema
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
