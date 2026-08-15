"use client";

import { useRef } from "react";
import { useDocumentStore } from "@/store/document.store";
import { scaleBBox } from "@/utils/bbox";
import { toCssColor } from "@/utils/color";
import { matchesSearch } from "@/utils/highlight";
import { cn } from "@/utils/cn";
import type { DocumentBlock } from "@/types/document";

interface BlockOverlayProps {
  block: DocumentBlock;
  scale: number;
}

export function BlockOverlay({ block, scale }: BlockOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const text = useDocumentStore((state) => state.getBlockText(block.id));
  const isSelected = useDocumentStore((state) => state.selectedBlockId === block.id);
  const searchQuery = useDocumentStore((state) => state.searchQuery);
  const selectBlock = useDocumentStore((state) => state.selectBlock);
  const updateBlockText = useDocumentStore((state) => state.updateBlockText);

  const rect = scaleBBox(block, scale);
  const isSearchMatch = matchesSearch(text, searchQuery);

  return (
    <textarea
      ref={textareaRef}
      aria-label={`Editable text block on page ${block.page_number + 1}`}
      value={text}
      onChange={(e) => updateBlockText(block.id, e.target.value)}
      onFocus={() => selectBlock(block.id)}
      spellCheck={false}
      className={cn(
        // bg-white masks the original PDF page's baked-in pixels for this
        // block's region — without it, the rendered page shows through a
        // transparent textarea at the same time the textarea draws its own
        // (identical) text, producing a doubled/ghosted look everywhere.
        "pointer-events-auto absolute resize-none overflow-hidden rounded-[2px] border border-transparent bg-white px-0.5 leading-tight outline-none transition-colors",
        // These all stay opaque too (bg-primary-50/yellow-100, not
        // bg-primary/5 or bg-warning/10) — a translucent background here
        // would let the original page's pixels bleed through again during
        // hover/select/search-highlight, the same masking problem as idle.
        "hover:border-primary/40 hover:bg-primary-50 focus:border-primary focus:bg-black/60 focus:shadow-sm",
        isSelected && "border-primary bg-primary-50",
        searchQuery && !isSearchMatch && "opacity-30",
        searchQuery && isSearchMatch && "bg-yellow-100",
      )}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        fontSize: rect.fontSize,
        fontWeight: block.is_bold ? 700 : 400,
        fontStyle: block.is_italic ? "italic" : "normal",
        color: toCssColor(block.color),
      }}
    />
  );
}
