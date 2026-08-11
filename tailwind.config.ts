import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand orange scale, seeded at #FF6B00 — kept in sync with the
        // accent tokens passed to defineTheme() in src/lib/astryx-theme.ts.
        primary: {
          DEFAULT: "#FF6B00",
          50: "#FFF4EB",
          100: "#FFE4CC",
          200: "#FFC599",
          300: "#FFA05C",
          400: "#FF8A33",
          500: "#FF6B00",
          600: "#E65F00",
          700: "#B34A00",
          800: "#803400",
          900: "#4D1F00",
        },
        background: "#FFFFFF",
        surface: "#FFFFFF",
        border: "#0B0B0B1A",
        success: "#15803D",
        danger: "#DC2626",
        warning: "#B45309",
        dark: {
          background: "#0B0B0B",
          surface: "#161616",
          border: "#FFFFFF1F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(11, 11, 11, 0.04), 0 4px 16px -4px rgba(11, 11, 11, 0.08)",
        glass: "0 8px 32px -8px rgba(11, 11, 11, 0.12)",
        "glow-accent": "0 0 0 1px rgba(255, 107, 0, 0.16), 0 8px 24px -8px rgba(255, 107, 0, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-scale": "fade-in-scale 0.2s cubic-bezier(0.24, 1, 0.4, 1)",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
