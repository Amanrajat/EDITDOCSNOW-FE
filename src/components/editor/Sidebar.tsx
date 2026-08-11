"use client";

import { useMemo, useState } from "react";
import { Selector } from "@astryxdesign/core/Selector";
import { Badge } from "@astryxdesign/core/Badge";
import { SearchInput } from "@/components/editor/SearchInput";
import { BlockList } from "@/components/editor/BlockList";
import { useDocumentStore } from "@/store/document.store";
import { matchesSearch } from "@/utils/highlight";
import type { DocumentBlock } from "@/types/document";

interface SidebarProps {
  blocks: DocumentBlock[];
  totalPages: number;
  onSelectBlock: (block: DocumentBlock) => void;
}

export function Sidebar({ blocks, totalPages, onSelectBlock }: SidebarProps) {
  const searchQuery = useDocumentStore((state) => state.searchQuery);
  const setSearchQuery = useDocumentStore((state) => state.setSearchQuery);
  const setCurrentPage = useDocumentStore((state) => state.setCurrentPage);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);
  const getBlockText = useDocumentStore((state) => state.getBlockText);
  const [pageFilter, setPageFilter] = useState("all");

  const pageOptions = useMemo(
    () => [
      { value: "all", label: "All pages" },
      ...Array.from({ length: totalPages }, (_, index) => ({
        value: String(index),
        label: `Page ${index + 1}`,
      })),
    ],
    [totalPages],
  );

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const matchesPage = pageFilter === "all" || block.page_number === Number(pageFilter);
      const matchesQuery = matchesSearch(getBlockText(block.id), searchQuery);
      return matchesPage && matchesQuery;
    });
  }, [blocks, pageFilter, searchQuery, getBlockText]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-border p-4 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black dark:text-white">Text blocks</h2>
          <Badge variant="neutral" label={`${filteredBlocks.length} / ${blocks.length}`} />
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} resultCount={filteredBlocks.length} />
        <Selector
          label="Filter by page"
          isLabelHidden
          options={pageOptions}
          value={pageFilter}
          onChange={(value) => {
            setPageFilter(value);
            if (value !== "all") setCurrentPage(Number(value));
          }}
          size="sm"
          width="100%"
        />
      </div>

      <div className="min-h-0 flex-1">
        <BlockList blocks={filteredBlocks} onSelect={onSelectBlock} focusBlockId={selectedBlockId} />
      </div>
    </div>
  );
}
