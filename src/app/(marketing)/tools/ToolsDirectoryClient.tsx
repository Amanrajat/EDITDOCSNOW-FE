"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TextInput } from "@astryxdesign/core/TextInput";
import { ToolCategory } from "@/components/common/ToolCategory";
import { TOOL_CATEGORIES } from "@/config/navigation";

/** Imports TOOL_CATEGORIES directly (rather than receiving it as a prop from
 * the server page) — the data includes lucide icon components, which can't
 * be passed as props across a Server-to-Client Component boundary. */
export function ToolsDirectoryClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOL_CATEGORIES;
    return TOOL_CATEGORIES
      .map((category) => ({
        ...category,
        tools: category.tools.filter(
          (tool) =>
            tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q),
        ),
      }))
      .filter((category) => category.tools.length > 0);
  }, [query]);

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-md">
        <TextInput
          label="Search tools"
          isLabelHidden
          value={query}
          onChange={setQuery}
          placeholder="Search tools…"
          startIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-white/50">No tools match &quot;{query}&quot;.</p>
      ) : (
        <div className="space-y-14">
          {filtered.map((category) => (
            <ToolCategory key={category.key} title={category.label} tools={category.tools} />
          ))}
        </div>
      )}
    </div>
  );
}
