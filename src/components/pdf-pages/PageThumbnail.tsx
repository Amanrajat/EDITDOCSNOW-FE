"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Page } from "react-pdf";
import { Check, GripVertical, RotateCcw, RotateCw, X } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { cn } from "@/utils/cn";

const THUMBNAIL_WIDTH = 130;
const THUMBNAIL_HEIGHT = 168;
/** Applied on top of the rotation transform for 90/270 previews so the
 * (now sideways) page still fits inside the portrait thumbnail footprint
 * instead of overflowing it. Purely cosmetic - actual output dimensions
 * are computed and verified server-side. */
const SIDEWAYS_SCALE = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;

interface PageThumbnailProps {
  /** The page's number in the ORIGINAL document (1-based) - what react-pdf
   * renders. Never changes for a given thumbnail. */
  pageNumber: number;
  /** Label shown under the thumbnail - the page's position in whatever
   * order it's currently displayed in (Organize) or just pageNumber
   * itself (Remove Pages, which never reorders). */
  position: number;
  isSelected: boolean;
  isDisabled?: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  /**
   * "reorder" (Organize PDF): draggable, primary-colored selection, grip
   * handle shown. "remove" (Remove Pages): not draggable, danger-colored
   * selection (marking a page red communicates "this will be deleted"
   * differently than "this is selected"), no grip handle. "rotate"
   * (Rotate PDF): not draggable, primary-colored selection, no grip handle.
   * "crop" (Crop PDF) / "page-numbers" (Page Numbers) / "pdf-to-jpg"
   * (PDF to JPG): not draggable, primary-colored selection, no grip
   * handle - a plain page-picker for "which pages does this operation
   * apply to".
   */
  variant?: "reorder" | "remove" | "rotate" | "crop" | "page-numbers" | "pdf-to-jpg";
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  /** Client-side rotation preview (degrees, any value - normalized via
   * CSS) - purely visual, applied before the user commits the operation. */
  rotationDegrees?: number;
  /** Rotate this page -90°/+90° (Rotate PDF only). Shown as small icon
   * buttons on hover so single pages can be nudged without a toolbar
   * bulk action. */
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
}

/**
 * Renders one page of the PDF as a small thumbnail via react-pdf, but only
 * once it has actually scrolled into (near) view - avoids mounting a full
 * canvas per page up front, which is what makes 100+ page documents stay
 * usable. Shared by Organize PDF (reorder) and Remove Pages (select).
 */
export function PageThumbnail({
  pageNumber,
  position,
  isSelected,
  isDisabled,
  onToggleSelect,
  onPreview,
  variant = "reorder",
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  rotationDegrees = 0,
  onRotateLeft,
  onRotateRight,
}: PageThumbnailProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const isDraggable = variant === "reorder" && !isDisabled;
  const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
  const isSideways = normalizedRotation === 90 || normalizedRotation === 270;

  useEffect(() => {
    if (shouldRender) return;
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={cardRef}
      draggable={isDraggable}
      data-thumbnail-page={pageNumber}
      data-thumbnail-position={position}
      data-thumbnail-selected={isSelected}
      onDragStart={isDraggable ? onDragStart : undefined}
      onDragOver={isDraggable ? onDragOver : undefined}
      onDrop={isDraggable ? onDrop : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      className={cn(
        "glass-card group relative flex flex-col items-center gap-2 rounded-xl border p-2 transition-colors",
        isSelected
          ? variant === "remove"
            ? "border-danger bg-danger/5"
            : "border-primary bg-primary/5"
          : "border-border",
        isDragging && "opacity-40",
        isDraggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        aria-pressed={isSelected}
        aria-label={
          isSelected
            ? `${variant === "remove" ? "Unmark" : "Deselect"} page ${pageNumber}`
            : `${variant === "remove" ? "Mark for removal:" : "Select"} page ${pageNumber}`
        }
        className={cn(
          "absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
          isSelected
            ? variant === "remove"
              ? "border-danger bg-danger text-white"
              : "border-primary bg-primary text-black"
            : "border-white/30 bg-black/40 text-transparent hover:border-white/60",
        )}
      >
        {variant === "remove" ? (
          <X className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Check className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>

      {variant === "reorder" && (
        <span
          className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center text-white/25"
          aria-hidden
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}

      <button
        type="button"
        onClick={onPreview}
        className="focus-ring-accent relative flex h-[168px] w-[130px] items-center justify-center overflow-hidden rounded-lg bg-white"
        aria-label={`Preview page ${pageNumber}`}
      >
        <div
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `rotate(${normalizedRotation}deg) scale(${isSideways ? SIDEWAYS_SCALE : 1})`,
          }}
        >
          {shouldRender ? (
            <Page
              pageNumber={pageNumber}
              width={THUMBNAIL_WIDTH}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={<Spinner size="sm" label="Rendering…" />}
            />
          ) : (
            <Spinner size="sm" label="Loading…" />
          )}
        </div>

        {variant === "rotate" && normalizedRotation !== 0 && (
          <span className="absolute bottom-1 right-1 z-10 rounded-md bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-black">
            {normalizedRotation}°
          </span>
        )}
      </button>

      {variant === "rotate" && (onRotateLeft || onRotateRight) && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onRotateLeft}
            disabled={isDisabled}
            aria-label={`Rotate page ${pageNumber} left 90 degrees`}
            className="focus-ring-accent flex h-6 w-6 items-center justify-center rounded-md border border-white/20 text-white/70 hover:border-white/40 hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onRotateRight}
            disabled={isDisabled}
            aria-label={`Rotate page ${pageNumber} right 90 degrees`}
            className="focus-ring-accent flex h-6 w-6 items-center justify-center rounded-md border border-white/20 text-white/70 hover:border-white/40 hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}

      <span className="text-xs font-medium text-white/60">Page {position}</span>
    </div>
  );
}
