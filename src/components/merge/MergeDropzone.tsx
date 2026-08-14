"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/utils/cn";

interface MergeDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export function MergeDropzone({ onFilesAdded, disabled }: MergeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const pdfFiles = Array.from(fileList).filter(
        (file) =>
          file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
      );
      if (pdfFiles.length) onFilesAdded(pdfFiles);
    },
    [onFilesAdded],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (!disabled) handleFiles(event.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Add PDF files to merge"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "glass-card focus-ring-accent relative flex min-h-[14rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-200",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        disabled && "cursor-default opacity-60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
          <UploadCloud className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-white">
          Drag &amp; drop PDFs here
        </h2>
        <p className="mt-1 text-sm text-white/55">
          or click to browse — add as many as you need
        </p>
        <Button label="Add files" variant="primary" className="mt-5" />
      </motion.div>
    </div>
  );
}
