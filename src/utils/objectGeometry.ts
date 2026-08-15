import type { EditorObject } from "@/types/document";

export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const MIN_SIZE_POINTS = 8;

/** Scale a PDF-point bbox into pixel coordinates for the rendered page (same convention as scaleBBox). */
export function scaleObjectRect(bbox: [number, number, number, number], scale: number): PixelRect {
  const [x0, y0, x1, y1] = bbox;
  return {
    left: x0 * scale,
    top: y0 * scale,
    width: Math.max((x1 - x0) * scale, 2),
    height: Math.max((y1 - y0) * scale, 2),
  };
}

export function scalePoints(points: [number, number][], scale: number): [number, number][] {
  return points.map(([x, y]) => [x * scale, y * scale]);
}

export function pxToPoints(px: number, scale: number): number {
  return px / scale;
}

/** Bounding box of a freehand path, in PDF points, used for hit-testing/eraser and move gestures. */
export function pathBounds(points: [number, number][]): [number, number, number, number] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

export function clampBBoxToPage(
  bbox: [number, number, number, number],
  pageWidth: number,
  pageHeight: number,
): [number, number, number, number] {
  let [x0, y0, x1, y1] = bbox;
  if (x1 - x0 < MIN_SIZE_POINTS) x1 = x0 + MIN_SIZE_POINTS;
  if (y1 - y0 < MIN_SIZE_POINTS) y1 = y0 + MIN_SIZE_POINTS;
  x0 = Math.max(0, Math.min(x0, pageWidth - MIN_SIZE_POINTS));
  y0 = Math.max(0, Math.min(y0, pageHeight - MIN_SIZE_POINTS));
  x1 = Math.max(x0 + MIN_SIZE_POINTS, Math.min(x1, pageWidth));
  y1 = Math.max(y0 + MIN_SIZE_POINTS, Math.min(y1, pageHeight));
  return [x0, y0, x1, y1];
}

/** Pure translation - preserves width/height exactly, only clamps position. */
export function translateBBox(
  bbox: [number, number, number, number],
  dx: number,
  dy: number,
  pageWidth: number,
  pageHeight: number,
): [number, number, number, number] {
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  const x0 = Math.max(0, Math.min(bbox[0] + dx, pageWidth - width));
  const y0 = Math.max(0, Math.min(bbox[1] + dy, pageHeight - height));
  return [x0, y0, x0 + width, y0 + height];
}

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

/** Resize by dragging one corner in the object's own (unrotated) local space; the opposite corner stays fixed. */
export function resizeBBoxCorner(
  bbox: [number, number, number, number],
  corner: ResizeCorner,
  dx: number,
  dy: number,
  pageWidth: number,
  pageHeight: number,
): [number, number, number, number] {
  let [x0, y0, x1, y1] = bbox;
  if (corner.includes("w")) x0 += dx;
  if (corner.includes("e")) x1 += dx;
  if (corner.includes("n")) y0 += dy;
  if (corner.includes("s")) y1 += dy;

  if (x0 > x1) [x0, x1] = [x1, x0];
  if (y0 > y1) [y0, y1] = [y1, y0];

  return clampBBoxToPage([x0, y0, x1, y1], pageWidth, pageHeight);
}

/** Inverse-rotate a screen-space delta into the object's local (unrotated) space. */
export function screenDeltaToLocal(dx: number, dy: number, rotationDegrees: number): [number, number] {
  const radians = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [dx * cos + dy * sin, -dx * sin + dy * cos];
}

export function bboxCenter(bbox: [number, number, number, number]): [number, number] {
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

/** Angle in degrees (clockwise, 0 = up) from a center point to a target point, for the rotate handle. */
export function angleFromCenter(center: [number, number], point: [number, number]): number {
  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  const radians = Math.atan2(dx, -dy);
  let degrees = (radians * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  return degrees;
}

export function defaultObjectBBox(
  centerX: number,
  centerY: number,
  width = 160,
  height = 60,
): [number, number, number, number] {
  return [centerX - width / 2, centerY - height / 2, centerX + width / 2, centerY + height / 2];
}

/** Whether a point (PDF-point space) falls inside an object's geometry - used by the eraser tool. */
export function objectContainsPoint(object: EditorObject, x: number, y: number): boolean {
  if (object.object_type === "path") {
    if (object.points.length === 0) return false;
    const [x0, y0, x1, y1] = pathBounds(object.points);
    const pad = Math.max(object.stroke_width, 6);
    return x >= x0 - pad && x <= x1 + pad && y >= y0 - pad && y <= y1 + pad;
  }
  if (object.bbox.length !== 4) return false;
  const [x0, y0, x1, y1] = object.bbox;
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}
