"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { FileText, UploadCloud } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { formatFileSize } from "@/utils/format";
import { cn } from "@/utils/cn";

const MAX_OFFICE_FILE_SIZE_BYTES = 50 * 1024 * 1024;

interface OfficeFileDropzoneProps {
  kind: "docx" | "xlsx" | "pptx";
  label: string;
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  progress: number;
  selectedFile: File | null;
}

const ACCEPT_BY_KIND: Record<OfficeFileDropzoneProps["kind"], string> = {
  docx: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

/** Single-file dropzone for Office documents (Word/Excel/PowerPoint -> PDF)
 * - same structure as UploadDropzone (PDF-only) and ImageDropzone
 * (JPG/PNG-only), parametrized by which Office format this instance accepts. */
export function OfficeFileDropzone({
  kind,
  label,
  onFileSelected,
  isUploading,
  progress,
  selectedFile,
}: OfficeFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload a .${kind} file`}
      onClick={() => !isUploading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isUploading) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isUploading) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "glass-card focus-ring-accent relative flex min-h-[22rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors duration-200",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        isUploading && "cursor-default",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_BY_KIND[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />

      {!isUploading && !selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
            <UploadCloud className="h-8 w-8" aria-hidden />
          </span>
          <h2 className="mt-6 text-xl font-semibold text-white">Drag &amp; drop your {label} here</h2>
          <p className="mt-2 text-sm text-white/55">or click to browse from your computer</p>
          <Button label="Browse files" variant="primary" className="mt-6" />
          <p className="mt-4 text-xs text-white/40">
            .{kind} only · Up to {formatFileSize(MAX_OFFICE_FILE_SIZE_BYTES)}
          </p>
        </motion.div>
      )}

      {(isUploading || selectedFile) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-sm flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
            <FileText className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-4 max-w-full truncate text-sm font-medium text-white">{selectedFile?.name}</p>
          {selectedFile && <p className="text-xs text-white/40">{formatFileSize(selectedFile.size)}</p>}

          <div className="mt-6 w-full">
            <ProgressBar
              label="Upload progress"
              isLabelHidden
              value={progress}
              hasValueLabel
              variant={progress >= 100 ? "success" : "accent"}
            />
          </div>

          {!isUploading && (
            <Button
              label="Choose a different file"
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
