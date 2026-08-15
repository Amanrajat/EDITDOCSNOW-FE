import { ToolCard } from "@/components/common/ToolCard";
import type { ToolMeta } from "@/config/navigation";

interface ToolCategoryProps {
  title: string;
  tools: ToolMeta[];
}

/** A titled grid of ToolCards — one category section on /tools or the
 * homepage showcase. */
export function ToolCategory({ title, tools }: ToolCategoryProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <ToolCard key={tool.slug} slug={tool.slug} index={index} />
        ))}
      </div>
    </div>
  );
}
