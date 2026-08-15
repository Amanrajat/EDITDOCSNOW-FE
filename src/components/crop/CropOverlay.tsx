"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/utils/cn";
import type { CropRect } from "@/types/pdf";

const MIN_FRACTION_SIZE = 0.03;

type Handle = "move" | "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

interface CropOverlayProps {
  /** Rendered page size in CSS pixels - the overlay's own coordinate
   * space. The crop rect (fractions of this box) is converted to/from
   * pixels purely for interaction; only fractions are ever reported up. */
  containerWidth: number;
  containerHeight: number;
  rect: CropRect;
  onChange: (rect: CropRect) => void;
  disabled?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * A draggable, resizable crop rectangle drawn over a rendered PDF page.
 * Purely a fraction-space (0..1) editor - it never knows the page's real
 * PDF-point dimensions, which is what lets the same component work
 * correctly regardless of the actual page size (the backend applies the
 * fractions to each target page's own box).
 */
export function CropOverlay({
  containerWidth,
  containerHeight,
  rect,
  onChange,
  disabled,
}: CropOverlayProps) {
  const dragState = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startRect: CropRect;
  } | null>(null);

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>, handle: Handle) {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    dragState.current = { handle, startX: event.clientX, startY: event.clientY, startRect: rect };
  }

  function onDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    if (!drag) return;

    const dxFrac = (event.clientX - drag.startX) / containerWidth;
    const dyFrac = (event.clientY - drag.startY) / containerHeight;
    const { handle, startRect } = drag;
    let { x0, y0, x1, y1 } = startRect;

    if (handle === "move") {
      const width = startRect.x1 - startRect.x0;
      const height = startRect.y1 - startRect.y0;
      x0 = clamp(startRect.x0 + dxFrac, 0, 1 - width);
      x1 = x0 + width;
      y0 = clamp(startRect.y0 + dyFrac, 0, 1 - height);
      y1 = y0 + height;
    } else {
      if (handle.includes("w")) x0 = clamp(startRect.x0 + dxFrac, 0, startRect.x1 - MIN_FRACTION_SIZE);
      if (handle.includes("e")) x1 = clamp(startRect.x1 + dxFrac, startRect.x0 + MIN_FRACTION_SIZE, 1);
      if (handle.includes("n")) y0 = clamp(startRect.y0 + dyFrac, 0, startRect.y1 - MIN_FRACTION_SIZE);
      if (handle.includes("s")) y1 = clamp(startRect.y1 + dyFrac, startRect.y0 + MIN_FRACTION_SIZE, 1);
    }

    onChange({ x0, y0, x1, y1 });
  }

  function endDrag() {
    dragState.current = null;
  }

  const left = rect.x0 * containerWidth;
  const top = rect.y0 * containerHeight;
  const width = (rect.x1 - rect.x0) * containerWidth;
  const height = (rect.y1 - rect.y0) * containerHeight;

  const edgeHandles: { handle: Handle; className: string; cursor: string }[] = [
    { handle: "n", className: "left-1/2 top-0 h-2 w-8 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-ns-resize" },
    { handle: "s", className: "left-1/2 bottom-0 h-2 w-8 -translate-x-1/2 translate-y-1/2", cursor: "cursor-ns-resize" },
    { handle: "w", className: "left-0 top-1/2 h-8 w-2 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
    { handle: "e", className: "right-0 top-1/2 h-8 w-2 translate-x-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
  ];
  const cornerHandles: { handle: Handle; className: string; cursor: string }[] = [
    { handle: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-nwse-resize" },
    { handle: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2", cursor: "cursor-nesw-resize" },
    { handle: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2", cursor: "cursor-nesw-resize" },
    { handle: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2", cursor: "cursor-nwse-resize" },
  ];

  return (
    <div
      data-crop-box
      className={cn(
        "absolute border-2 border-primary",
        !disabled && "cursor-move",
      )}
      style={{ left, top, width, height, boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
      onPointerDown={(event) => beginDrag(event, "move")}
      onPointerMove={onDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {!disabled &&
        edgeHandles.map(({ handle, className, cursor }) => (
          <div
            key={handle}
            data-crop-handle={handle}
            aria-label={`Resize crop ${handle === "n" ? "top" : handle === "s" ? "bottom" : handle === "w" ? "left" : "right"} edge`}
            className={cn("absolute rounded-sm bg-primary", className, cursor)}
            onPointerDown={(event) => beginDrag(event, handle)}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        ))}
      {!disabled &&
        cornerHandles.map(({ handle, className, cursor }) => (
          <div
            key={handle}
            data-crop-handle={handle}
            aria-label={`Resize crop ${handle} corner`}
            className={cn("absolute h-3 w-3 rounded-full border-2 border-primary bg-white", className, cursor)}
            onPointerDown={(event) => beginDrag(event, handle)}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        ))}
    </div>
  );
}
