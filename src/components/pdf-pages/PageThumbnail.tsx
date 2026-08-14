"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Page } from "react-pdf";
import { Check, GripVertical, X } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { cn } from "@/utils/cn";

const THUMBNAIL_WIDTH = 130;

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
   * differently than "this is selected"), no grip handle.
   */
  variant?: "reorder" | "remove";
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
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
}: PageThumbnailProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const isDraggable = variant === "reorder" && !isDisabled;

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
        className="focus-ring-accent flex h-[168px] w-[130px] items-center justify-center overflow-hidden rounded-lg bg-white"
        aria-label={`Preview page ${pageNumber}`}
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
      </button>

      <span className="text-xs font-medium text-white/60">Page {position}</span>
    </div>
  );
}
