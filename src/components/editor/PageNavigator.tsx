"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { TextInput } from "@astryxdesign/core/TextInput";

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
}

export function PageNavigator({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
}: PageNavigatorProps) {
  const [inputValue, setInputValue] = useState(String(currentPage + 1));

  useEffect(() => setInputValue(String(currentPage + 1)), [currentPage]);

  function commit() {
    const page = Number(inputValue);
    if (Number.isFinite(page)) {
      onGoToPage(page - 1);
    } else {
      setInputValue(String(currentPage + 1));
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        label="Previous page"
        icon={<ChevronLeft className="h-4 w-4" />}
        variant="ghost"
        size="sm"
        isDisabled={currentPage <= 0}
        onClick={onPrev}
      />
      <div className="flex items-center gap-1.5 text-sm text-black/55 dark:text-white/55">
        <TextInput
          label="Page number"
          isLabelHidden
          value={inputValue}
          onChange={setInputValue}
          onEnter={commit}
          onBlur={commit}
          width={44}
          size="sm"
        />
        <span>/ {totalPages}</span>
      </div>
      <IconButton
        label="Next page"
        icon={<ChevronRight className="h-4 w-4" />}
        variant="ghost"
        size="sm"
        isDisabled={currentPage >= totalPages - 1}
        onClick={onNext}
      />
    </div>
  );
}
