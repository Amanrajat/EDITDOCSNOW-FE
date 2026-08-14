import { type ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { editDocsNowTheme } from "@/lib/astryx-theme";

/**
 * Dark is the app's only theme — `mode` is hardcoded rather than read from
 * user/system preference. `<html data-theme="dark">` in src/app/layout.tsx
 * matches this on the very first server-rendered paint, so there's no flash.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <Theme theme={editDocsNowTheme} mode="dark">
      {children}
    </Theme>
  );
}
