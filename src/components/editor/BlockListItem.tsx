"use client";

import { memo } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { TextArea } from "@astryxdesign/core/TextArea";
import { useDocumentStore } from "@/store/document.store";
import { cn } from "@/utils/cn";
import type { DocumentBlock } from "@/types/document";

interface BlockListItemProps {
  block: DocumentBlock;
  onSelect: (block: DocumentBlock) => void;
}

function BlockListItemImpl({ block, onSelect }: BlockListItemProps) {
  const text = useDocumentStore((state) => state.getBlockText(block.id));
  const isSelected = useDocumentStore((state) => state.selectedBlockId === block.id);
  const updateBlockText = useDocumentStore((state) => state.updateBlockText);

  return (
    <div
      id={`block-list-item-${block.id}`}
      className={cn(
        "rounded-xl border p-3 transition-colors",
        isSelected
          ? "border-primary bg-primary/5 shadow-soft"
          : "border-border bg-surface hover:border-primary/40",
      )}
      onClick={() => onSelect(block)}
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="neutral" label={`Page ${block.page_number + 1}`} />
        <div className="flex items-center gap-1">
          {block.is_bold && <Badge variant="info" label="B" />}
          {block.is_italic && <Badge variant="purple" label="I" />}
        </div>
      </div>
      <TextArea
        label={`Block text on page ${block.page_number + 1}`}
        isLabelHidden
        value={text}
        onChange={(value) => updateBlockText(block.id, value)}
        onFocus={() => onSelect(block)}
        rows={2}
        size="sm"
        width="100%"
      />
    </div>
  );
}

export const BlockListItem = memo(BlockListItemImpl);
