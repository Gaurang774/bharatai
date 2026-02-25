/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0d0d",
        card: "#1a1a1a",
        primary: {
          DEFAULT: "#f59e0b",
          foreground: "#000000",
        },
        secondary: "#1f1f1f",
        muted: "#a3a3a3",
        danger: "#ef4444",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
};
