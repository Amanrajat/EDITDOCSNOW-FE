"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import {
  TopNav,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuItem,
  TopNavMenu,
  useTopNavRenderMode,
} from "@astryxdesign/core/TopNav";
import {
  COMPRESS_TOOLS,
  CONVERT_FROM_PDF,
  CONVERT_TO_PDF,
  EDIT_TOOLS,
  OCR_TOOL,
  ORGANIZE_TOOLS,
  RESOURCE_LINKS,
  type ResourceLink,
  type ToolMeta,
} from "@/config/navigation";
import { Logo } from "./Logo";

function isActiveGroup(pathname: string, hrefs: string[]): boolean {
  return hrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}

function toMenuItems(entries: (ToolMeta | ResourceLink)[]) {
  return entries.map((entry) => ({
    title: entry.title,
    description: entry.description,
    icon: <entry.icon className="h-4 w-4" />,
    href: entry.href,
  }));
}

/** The compact mobile-bar row (logo + CTA + hamburger) has too little room
 * for the full "Upload PDF" label at very narrow widths (e.g. 320px) —
 * shorten it there. Desktop and the drawer keep the full label. */
function UploadCta() {
  const renderMode = useTopNavRenderMode();
  const label = renderMode === "mobile-bar" ? "Upload" : "Upload PDF";
  return <Button label={label} variant="primary" size="sm" as={Link} href="/upload" />;
}

interface HeaderProps {
  /** "full" = marketing nav + CTA. "minimal" = editor top bar (logo + a
   * single escape hatch back to /upload). */
  variant?: "full" | "minimal";
}

export function Header({ variant = "full" }: HeaderProps) {
  const pathname = usePathname();

  if (variant === "minimal") {
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <Link
            href="/upload"
            className="focus-ring-accent rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
          >
            Upload another file
          </Link>
        </div>
      </header>
    );
  }

  return (
    <div className="border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TopNav
          label="Primary"
          heading={<Logo />}
          endContent={<UploadCta />}
        >
          <TopNavMegaMenu
            label="PDF Tools"
            items={
              <>
                {ORGANIZE_TOOLS.map((tool) => (
                  <TopNavMegaMenuItem
                    key={tool.slug}
                    title={tool.title}
                    description={tool.description}
                    icon={<tool.icon className="h-4 w-4" />}
                    href={tool.href}
                    as={Link}
                  />
                ))}
              </>
            }
          />
          <TopNavMegaMenu
            label="Convert PDF"
            items={
              <>
                <div>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                    PDF → Other Formats
                  </p>
                  {CONVERT_FROM_PDF.map((tool) => (
                    <TopNavMegaMenuItem
                      key={tool.slug}
                      title={tool.title}
                      description={tool.description}
                      icon={<tool.icon className="h-4 w-4" />}
                      href={tool.href}
                      as={Link}
                    />
                  ))}
                </div>
                <div>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Other Formats → PDF
                  </p>
                  {CONVERT_TO_PDF.map((tool) => (
                    <TopNavMegaMenuItem
                      key={tool.slug}
                      title={tool.title}
                      description={tool.description}
                      icon={<tool.icon className="h-4 w-4" />}
                      href={tool.href}
                      as={Link}
                    />
                  ))}
                </div>
              </>
            }
          />
          <TopNavMenu label="Edit PDF" items={toMenuItems(EDIT_TOOLS)} />
          <TopNavMenu label="Compress" items={toMenuItems(COMPRESS_TOOLS)} />
          <TopNavItem
            label="OCR"
            href={OCR_TOOL.href}
            isSelected={isActiveGroup(pathname, [OCR_TOOL.href])}
            as={Link}
          />
          <TopNavMenu label="Resources" items={toMenuItems(RESOURCE_LINKS)} />
        </TopNav>
      </div>
    </div>
  );
}
