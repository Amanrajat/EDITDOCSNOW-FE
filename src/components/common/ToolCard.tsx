"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@astryxdesign/core/Card";
import { getToolBySlug } from "@/config/navigation";

interface ToolCardProps {
  /** Tool slug, looked up client-side — icon components can't be passed as
   * props from a Server Component into this Client Component. */
  slug: string;
  index?: number;
}

/** Icon + title + description card linking to a real tool route. Used by
 * the /tools directory, the homepage showcase, and RelatedTools. */
export function ToolCard({ slug, index = 0 }: ToolCardProps) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const Icon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={tool.href} className="focus-ring-accent block h-full rounded-2xl">
        <Card
          variant="default"
          padding={6}
          className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-400">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-white">{tool.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{tool.description}</p>
        </Card>
      </Link>
    </motion.div>
  );
}
