import { defineTheme } from "@astryxdesign/core/theme";

/**
 * EditDocsNow brand theme — Orange / Black / White.
 *
 * `color.accent` seeds Astryx's HCT color-scale generator (drives hover/press
 * states, focus rings, and every "accent" token across all ~25 components).
 * We then pin the handful of tokens that need an exact brand value rather
 * than a generated one — explicit `tokens` entries always win over the
 * generated scale (see defineTheme.d.ts).
 *
 * `--color-on-accent` is intentionally near-black, not white: white text on
 * #FF6B00 only hits ~2.9:1 contrast (fails WCAG AA for text). Near-black on
 * #FF6B00 hits ~6.9:1. `--color-text-accent` (orange used as a text/link
 * color on a light surface) uses a deeper burnt-orange for the same reason —
 * the vivid brand orange is reserved for icons, borders, and filled surfaces.
 */
export const editDocsNowTheme = defineTheme({
  name: "editdocsnow",

  color: {
    accent: "#FF6B00",
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
    "--color-accent": ["#FF6B00", "#FF7E1F"],
    "--color-accent-muted": ["rgba(255, 107, 0, 0.10)", "rgba(255, 126, 31, 0.16)"],
    "--color-on-accent": ["#0B0B0B", "#0B0B0B"],
    "--color-text-accent": ["#B34A00", "#FF8A33"],
    "--color-icon-accent": ["#FF6B00", "#FF7E1F"],

    // Neutrals — true black/white, not blue-tinted grays
    "--color-background-body": ["#FFFFFF", "#0B0B0B"],
    "--color-background-surface": ["#FFFFFF", "#131313"],
    "--color-background-card": ["#FFFFFF", "#161616"],
    "--color-background-popover": ["#FFFFFF", "#1A1A1A"],
    "--color-background-muted": ["rgba(11, 11, 11, 0.04)", "rgba(255, 255, 255, 0.06)"],
    "--color-background-inverted": ["#0B0B0B", "#FFFFFF"],
    "--color-overlay": ["rgba(11, 11, 11, 0.45)", "rgba(0, 0, 0, 0.7)"],
    "--color-overlay-hover": ["rgba(11, 11, 11, 0.04)", "rgba(255, 255, 255, 0.06)"],
    "--color-overlay-pressed": ["rgba(11, 11, 11, 0.08)", "rgba(255, 255, 255, 0.10)"],

    "--color-text-primary": ["#0B0B0B", "#F5F5F5"],
    "--color-text-secondary": ["#5C5C5C", "#A3A3A3"],
    "--color-text-disabled": ["#A3A3A3", "#6B6B6B"],

    "--color-icon-primary": ["#0B0B0B", "#F5F5F5"],
    "--color-icon-secondary": ["#5C5C5C", "#A3A3A3"],
    "--color-icon-disabled": ["#A3A3A3", "#6B6B6B"],

    "--color-border": ["rgba(11, 11, 11, 0.10)", "rgba(255, 255, 255, 0.12)"],
    "--color-border-emphasized": ["rgba(11, 11, 11, 0.18)", "rgba(255, 255, 255, 0.22)"],
    "--color-skeleton": ["#EBEBEB", "#262626"],
    "--color-track": ["#EBEBEB", "#262626"],
    "--color-shadow": ["rgba(11, 11, 11, 0.10)", "rgba(0, 0, 0, 0.5)"],

    // Status — kept semantically distinct from brand orange
    "--color-success": ["#15803D", "#22C55E"],
    "--color-error": ["#DC2626", "#F87171"],
    "--color-warning": ["#B45309", "#FBBF24"],
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
