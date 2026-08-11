"use client";

import { Search } from "lucide-react";
import { TextInput } from "@astryxdesign/core/TextInput";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export function SearchInput({ value, onChange, resultCount }: SearchInputProps) {
  return (
    <TextInput
      label="Search blocks"
      isLabelHidden
      value={value}
      onChange={onChange}
      placeholder="Search block text…"
      startIcon={<Search className="h-4 w-4" />}
      hasClear
      width="100%"
      description={
        value && resultCount !== undefined
          ? `${resultCount} match${resultCount === 1 ? "" : "es"}`
          : undefined
      }
    />
  );
}
