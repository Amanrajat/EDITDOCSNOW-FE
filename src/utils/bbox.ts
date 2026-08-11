import type { DocumentBlock } from "@/types/document";

export interface OverlayRect {
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
}

/**
 * Scale a block's PDF-point bbox into pixel coordinates for the rendered page.
 * scale = renderedWidth / pageWidthInPoints
 */
export function scaleBBox(block: DocumentBlock, scale: number): OverlayRect {
  const [x0, y0, x1, y1] = block.bbox;
  return {
    left: x0 * scale,
    top: y0 * scale,
    width: Math.max((x1 - x0) * scale, 4),
    height: Math.max((y1 - y0) * scale, 4),
    fontSize: Math.max(block.font_size * scale, 1),
  };
}

export function computeScale(renderedWidth: number, pageWidthPoints: number): number {
  if (!pageWidthPoints) return 1;
  return renderedWidth / pageWidthPoints;
}
