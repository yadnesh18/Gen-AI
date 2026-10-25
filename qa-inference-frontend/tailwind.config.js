/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chat: {
          user: '#2563eb',
          assistant: '#f3f4f6',
          assistantDark: '#1e293b',
        }
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1.0)' },
        }
      },
      animation: {
        'bounce-dot-1': 'bounceDot 1.4s infinite ease-in-out 0s',
        'bounce-dot-2': 'bounceDot 1.4s infinite ease-in-out 0.2s',
        'bounce-dot-3': 'bounceDot 1.4s infinite ease-in-out 0.4s',
      }
    },
  },
  plugins: [],
};
