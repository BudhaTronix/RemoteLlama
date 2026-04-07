import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: "var(--shadow-panel)",
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
        glow: "0 0 0 1px rgba(87, 109, 255, 0.12), 0 12px 30px -14px rgba(87, 109, 255, 0.35)",
      },
      colors: {
        surface: "var(--surface)",
        surfaceAlt: "var(--surface-alt)",
        surfaceMuted: "var(--surface-muted)",
        surfaceSolid: "var(--surface-solid)",
        stroke: "var(--stroke)",
        strokeStrong: "var(--stroke-strong)",
        brand: "var(--brand)",
        brandStrong: "var(--brand-strong)",
        brandSoft: "var(--brand-soft)",
        ink: "var(--ink)",
        inkSoft: "var(--ink-soft)",
        muted: "var(--muted)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        success: "var(--success)",
      },
      borderRadius: {
        shell: "var(--radius-shell)",
        panel: "var(--radius-panel)",
        pill: "999px",
      },
      animation: {
        "fade-in": "fade-in 0.32s ease-out",
        "slide-up": "slide-up 0.28s ease-out",
        "float-in": "float-in 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 2.6s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
