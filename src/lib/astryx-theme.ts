import { defineTheme } from "@astryxdesign/core/theme";

/**
 * EditDocsNow brand theme — permanent dark mode, restricted to Orange
 * (#FF7A00) / Black (#0D0D0D) / White (#FFFFFF) plus tints/shades of those
 * three. There is no light mode: every token below uses the same value for
 * both slots of Astryx's [light, dark] tuple so the theme renders identically
 * regardless of `color-scheme` (see ThemeProvider, which also hardcodes
 * `mode="dark"`).
 *
 * `color.accent` seeds Astryx's HCT color-scale generator (drives hover/press
 * states, focus rings, and every "accent" token across all ~25 components).
 * We then pin the handful of tokens that need an exact brand value rather
 * than a generated one — explicit `tokens` entries always win over the
 * generated scale (see defineTheme.d.ts).
 *
 * `--color-on-accent` is near-black, not white: white text on #FF7A00 only
 * hits ~2.6:1 contrast (fails WCAG AA for text). Black (#0D0D0D) on #FF7A00
 * hits ~8:1. `--color-text-accent` (orange used as a text/link color) uses a
 * lighter orange tint, which comfortably clears contrast against the black
 * background (~9:1) while reading as a lighter, more legible accent.
 *
 * Status colors (success/error/warning) are kept as a deliberate, explicit
 * exception to the 3-color rule — conventional red/green/amber semantics for
 * error/success/warning states, tuned for contrast against the dark surface.
 */
export const editDocsNowTheme = defineTheme({
  name: "editdocsnow",

  color: {
    accent: "#FF7A00",
    neutralStyle: "neutral",
    contrast: "high",
  },

  typography: {
    body: { family: "var(--font-inter)", fallbacks: "system-ui, sans-serif" },
    heading: { family: "var(--font-inter)", weight: "semibold" },
  },

  motion: { fast: 120, medium: 280, slow: 600, ratio: 0.75 },

  tokens: {
    // Accent — brand orange, pinned for exact hue control + accessible on-accent text
    "--color-accent": ["#FF7A00", "#FF7A00"],
    "--color-accent-muted": ["rgba(255, 122, 0, 0.14)", "rgba(255, 122, 0, 0.14)"],
    "--color-on-accent": ["#0D0D0D", "#0D0D0D"],
    "--color-text-accent": ["#FF9534", "#FF9534"],
    "--color-icon-accent": ["#FF7A00", "#FF7A00"],

    // Neutrals — true black/white only, no hues outside the brand palette
    "--color-background-body": ["#0D0D0D", "#0D0D0D"],
    "--color-background-surface": ["#151515", "#151515"],
    "--color-background-card": ["#181818", "#181818"],
    "--color-background-popover": ["#1E1E1E", "#1E1E1E"],
    "--color-background-muted": ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.06)"],
    "--color-background-inverted": ["#FFFFFF", "#FFFFFF"],
    "--color-overlay": ["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.7)"],
    "--color-overlay-hover": ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.06)"],
    "--color-overlay-pressed": ["rgba(255, 255, 255, 0.10)", "rgba(255, 255, 255, 0.10)"],

    "--color-text-primary": ["#F5F5F5", "#F5F5F5"],
    "--color-text-secondary": ["#A3A3A3", "#A3A3A3"],
    "--color-text-disabled": ["#6B6B6B", "#6B6B6B"],

    "--color-icon-primary": ["#F5F5F5", "#F5F5F5"],
    "--color-icon-secondary": ["#A3A3A3", "#A3A3A3"],
    "--color-icon-disabled": ["#6B6B6B", "#6B6B6B"],

    "--color-border": ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.12)"],
    "--color-border-emphasized": ["rgba(255, 255, 255, 0.22)", "rgba(255, 255, 255, 0.22)"],
    "--color-skeleton": ["#262626", "#262626"],
    "--color-track": ["#262626", "#262626"],
    "--color-shadow": ["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.5)"],

    // Status — kept semantically distinct from brand orange (see file header)
    "--color-success": ["#22C55E", "#22C55E"],
    "--color-error": ["#F87171", "#F87171"],
    "--color-warning": ["#FBBF24", "#FBBF24"],
  },

  components: {
    button: {
      base: { fontWeight: "var(--font-weight-semibold)" },
    },
    card: {
      base: { borderColor: "var(--color-border)" },
    },
  },
});
