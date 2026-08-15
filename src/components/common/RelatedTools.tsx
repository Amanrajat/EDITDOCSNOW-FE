import { ToolCard } from "@/components/common/ToolCard";
import type { ToolMeta } from "@/config/navigation";

interface RelatedToolsProps {
  tools: ToolMeta[];
}

/** "Related PDF Tools" section at the bottom of a tool page. */
export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Related PDF Tools</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <ToolCard key={tool.slug} slug={tool.slug} index={index} />
        ))}
      </div>
    </section>
  );
}
