import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand orange scale, seeded at #FF7A00 — kept in sync with the
        // accent tokens passed to defineTheme() in src/lib/astryx-theme.ts.
        // The app is permanently dark and restricted to orange/black/white —
        // every step below is a tint (blended toward white) or shade
        // (blended toward black) of that same orange.
        primary: {
          DEFAULT: "#FF7A00",
          50: "#FFF5EC",
          100: "#FFE6CF",
          200: "#FFCA99",
          300: "#FFAA5C",
          400: "#FF9534",
          500: "#FF7A00",
          600: "#E46D00",
          700: "#B35500",
          800: "#7D3C00",
          900: "#4D2500",
        },
        background: "#0D0D0D",
        surface: "#181818",
        border: "#FFFFFF1F",
        // Functional status colors are a deliberate exception to the 3-color
        // brand palette (kept for accessible, conventional error/success/
        // warning semantics) — tuned for contrast against the dark background.
        success: "#22C55E",
        danger: "#F87171",
        warning: "#FBBF24",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(0, 0, 0, 0.24), 0 4px 16px -4px rgba(0, 0, 0, 0.32)",
        glass: "0 8px 32px -8px rgba(0, 0, 0, 0.4)",
        "glow-accent": "0 0 0 1px rgba(255, 122, 0, 0.16), 0 8px 24px -8px rgba(255, 122, 0, 0.35)",
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
