import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blush: { DEFAULT: "#f8d9d0", soft: "#fdf0ec" },
        peach: { DEFAULT: "#ffd8c2", soft: "#fff0e6" },
        mint: { DEFAULT: "#d4efe8", soft: "#eef9f5" },
        lavender: { DEFAULT: "#e8dff5", soft: "#f5f0fb" },
        cream: "#fff5eb",
        sage: "#9cc5b0",
        rose: {
          50: "#fff5f5",
          100: "#ffe4e4",
          200: "#fecaca",
          300: "#f5b0b0",
          400: "#e8a0a0",
          500: "#d48484",
          600: "#b86a6a",
          700: "#9a5555",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
