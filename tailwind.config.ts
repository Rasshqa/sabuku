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
        warm: {
          50: "#F7F7F8",
        },
        pastel: {
          peach: "#FFCDB8",
          yellow: "#FFE4A8",
          mint: "#C7EBD5",
          cyan: "#B9E6E8",
          sky: "#B9E2F2",
          lavender: "#C9C8F3",
          pink: "#F2B5D4",
          coral: "#F5B1A8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "24px",
        nav: "32px",
        pill: "18px",
      },
      spacing: {
        section: "80px",
        card: "32px",
      },
      boxShadow: {
        card: "0 6px 24px rgba(0, 0, 0, 0.05)",
        nav: "0 8px 32px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
