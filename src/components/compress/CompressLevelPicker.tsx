"use client";

import { SelectableCard } from "@astryxdesign/core/SelectableCard";
import type { CompressLevel } from "@/types/pdf";

const LEVELS: { value: CompressLevel; label: string; description: string }[] = [
  { value: "high_quality", label: "High Quality", description: "Minimal compression - best for print or archival." },
  { value: "recommended", label: "Recommended", description: "Balanced quality and size - good for most PDFs." },
  { value: "high_compression", label: "High Compression", description: "Smaller files, some image quality loss." },
  { value: "maximum_compression", label: "Maximum Compression", description: "Smallest possible file - noticeable image quality loss." },
];

interface CompressLevelPickerProps {
  value: CompressLevel;
  onChange: (level: CompressLevel) => void;
  disabled?: boolean;
}

/** Shared 4-tier compression level picker - used by both single-file
 * Compress PDF and Batch Compress so the tiers/descriptions stay in sync
 * in exactly one place. */
export function CompressLevelPicker({ value, onChange, disabled }: CompressLevelPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {LEVELS.map((option) => (
        <SelectableCard
          key={option.value}
          label={option.label}
          isSelected={value === option.value}
          onChange={(selected) => selected && onChange(option.value)}
          isDisabled={disabled}
          padding={4}
        >
          <p className="font-medium text-white">{option.label}</p>
          <p className="mt-1 text-xs text-white/55">{option.description}</p>
        </SelectableCard>
      ))}
    </div>
  );
}
