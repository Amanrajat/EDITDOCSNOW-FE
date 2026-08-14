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
        "pointer-events-auto absolute resize-none overflow-hidden rounded-[2px] border border-transparent bg-transparent px-0.5 leading-tight outline-none transition-colors",
        "hover:border-primary/40 hover:bg-primary/5 focus:border-primary focus:bg-black/60 focus:shadow-sm",
        isSelected && "border-primary bg-primary/5",
        searchQuery && !isSearchMatch && "opacity-30",
        searchQuery && isSearchMatch && "bg-warning/10",
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
