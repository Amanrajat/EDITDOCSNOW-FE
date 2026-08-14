"use client";

import { useEffect, useRef, useState, type UIEvent } from "react";
import { BlockListItem } from "@/components/editor/BlockListItem";
import type { DocumentBlock } from "@/types/document";

const ESTIMATED_ITEM_HEIGHT = 148;
const OVERSCAN = 4;

interface BlockListProps {
  blocks: DocumentBlock[];
  onSelect: (block: DocumentBlock) => void;
  focusBlockId?: string | null;
}

/** Lightweight windowed list: renders only blocks near the visible scroll range. */
export function BlockList({ blocks, onSelect, focusBlockId }: BlockListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop);
  }

  useEffect(() => {
    if (!focusBlockId || !scrollRef.current) return;
    const index = blocks.findIndex((block) => block.id === focusBlockId);
    if (index === -1) return;
    const target = Math.max(0, index * ESTIMATED_ITEM_HEIGHT - viewportHeight / 2);
    scrollRef.current.scrollTo({ top: target, behavior: "smooth" });
    setScrollTop(target);
    // Only re-run when the focus target or list identity changes, not on every scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusBlockId, blocks.length]);

  const firstVisible = Math.max(0, Math.floor(scrollTop / ESTIMATED_ITEM_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ESTIMATED_ITEM_HEIGHT) + OVERSCAN * 2;
  const lastVisible = Math.min(blocks.length, firstVisible + visibleCount);

  const topSpacer = firstVisible * ESTIMATED_ITEM_HEIGHT;
  const bottomSpacer = Math.max(0, (blocks.length - lastVisible) * ESTIMATED_ITEM_HEIGHT);

  if (blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/40">
        No blocks match your search.
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        scrollRef.current = node;
        if (node && viewportHeight !== node.clientHeight && node.clientHeight > 0) {
          setViewportHeight(node.clientHeight);
        }
      }}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 py-3"
    >
      <div style={{ height: topSpacer }} />
      <div className="flex flex-col gap-3">
        {blocks.slice(firstVisible, lastVisible).map((block) => (
          <BlockListItem key={block.id} block={block} onSelect={onSelect} />
        ))}
      </div>
      <div style={{ height: bottomSpacer }} />
    </div>
  );
}
