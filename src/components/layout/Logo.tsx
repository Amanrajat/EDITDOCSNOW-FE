import Link from "next/link";
import { FileEdit } from "lucide-react";
import { cn } from "@/utils/cn";

const SIZES = {
  sm: { mark: "h-7 w-7", icon: "h-3.5 w-3.5", text: "text-sm" },
  md: { mark: "h-9 w-9", icon: "h-4 w-4", text: "text-lg" },
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

/** Brand mark + wordmark — shared by the marketing Header, the editor top
 * bar, and the Footer so the logo only needs restyling in one place. */
export function Logo({ size = "md", className }: LogoProps) {
  const s = SIZES[size];
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-semibold text-white focus-ring-accent rounded-lg",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-black shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
          s.mark,
        )}
      >
        <FileEdit className={s.icon} aria-hidden />
      </span>
      <span className={cn("tracking-tight", s.text)}>EditDocsNow</span>
    </Link>
  );
}
