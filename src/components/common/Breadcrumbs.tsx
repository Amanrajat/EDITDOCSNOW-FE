import { Breadcrumbs as AstryxBreadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { BreadcrumbItem } from "@astryxdesign/core/Breadcrumbs";

export interface BreadcrumbTrailItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbTrailItem[];
}

/** Thin wrapper over @astryxdesign/core's Breadcrumbs so tool pages can pass
 * a plain {label, href} array instead of composing BreadcrumbItem by hand. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <AstryxBreadcrumbs>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <BreadcrumbItem key={item.label} href={item.href} isCurrent={isLast || !item.href}>
            {item.label}
          </BreadcrumbItem>
        );
      })}
    </AstryxBreadcrumbs>
  );
}
