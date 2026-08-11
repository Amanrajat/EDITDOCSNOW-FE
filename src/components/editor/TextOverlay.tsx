"use client";

import type { DocumentBlock } from "@/types/document";
import { BlockOverlay } from "@/components/editor/BlockOverlay";

interface TextOverlayProps {
  blocks: DocumentBlock[];
  scale: number;
}

export function TextOverlay({ blocks, scale }: TextOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={blocks.length === 0}>
      {blocks.map((block) => (
        <BlockOverlay key={block.id} block={block} scale={scale} />
      ))}
    </div>
  );
}
