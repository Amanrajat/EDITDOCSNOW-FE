/** Normalize a hex color string from the backend into a safe CSS color. */
export function toCssColor(color: string | undefined | null): string {
  if (!color) return "#0B0B0B";
  const trimmed = color.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

/** Pick readable foreground text (black/white) for a given background hex. */
export function getContrastColor(hex: string): "#000000" | "#FFFFFF" {
  const normalized = toCssColor(hex).replace("#", "");
  if (normalized.length !== 6) return "#000000";
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}
