import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          900: '#0F3D2E',
          800: '#16533F',
          950: '#09271D',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          hover: '#B89428',
        },
      },
    },
  },
  plugins: [],
};

export default config;
