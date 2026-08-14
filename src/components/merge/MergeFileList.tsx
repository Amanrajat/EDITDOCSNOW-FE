"use client";

import { useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, FileText, GripVertical, X } from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { formatFileSize } from "@/utils/format";
import { cn } from "@/utils/cn";

interface MergeFileListProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop reorderable file list, with keyboard-accessible up/down
 * buttons as an equivalent to pure pointer drag (no DnD library dependency
 * - plain HTML5 drag events, consistent with UploadDropzone's approach).
 */
export function MergeFileList({ files, onReorder, onRemove, disabled }: MergeFileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= files.length || from === to) return;
    const next = [...files];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    onReorder(next);
  }

  function handleDrop(event: DragEvent<HTMLLIElement>, index: number) {
    event.preventDefault();
    if (draggedIndex !== null) move(draggedIndex, index);
    setDraggedIndex(null);
  }

  return (
    <ul className="flex w-full flex-col gap-2" aria-label="Files to merge, in order">
      <AnimatePresence initial={false}>
        {files.map((file, index) => (
          <motion.li
            key={`${file.name}-${file.size}-${index}`}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -8 }}
            draggable={!disabled}
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={() => setDraggedIndex(null)}
            className={cn(
              "glass-card flex items-center gap-3 rounded-xl border border-border px-3 py-2.5",
              draggedIndex === index && "opacity-50",
            )}
          >
            <span
              className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-white/30 active:cursor-grabbing"
              aria-hidden
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-400">
              <FileText className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
            </div>
            <span className="shrink-0 text-xs text-white/30">#{index + 1}</span>
            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                label="Move up"
                icon={<ChevronUp className="h-4 w-4" />}
                variant="ghost"
                size="sm"
                onClick={() => move(index, index - 1)}
                isDisabled={disabled || index === 0}
              />
              <IconButton
                label="Move down"
                icon={<ChevronDown className="h-4 w-4" />}
                variant="ghost"
                size="sm"
                onClick={() => move(index, index + 1)}
                isDisabled={disabled || index === files.length - 1}
              />
              <IconButton
                label={`Remove ${file.name}`}
                icon={<X className="h-4 w-4" />}
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                isDisabled={disabled}
              />
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
