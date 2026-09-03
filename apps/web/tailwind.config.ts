import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090b11',
        panel: '#12151d',
        card: '#191d27',
        line: '#292e3a',
        violet: '#8b78f6',
        mint: '#60e8bd',
      },
      boxShadow: {
        glow: '0 18px 45px rgba(139, 120, 246, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
