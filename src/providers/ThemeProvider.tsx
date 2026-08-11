"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { editDocsNowTheme } from "@/lib/astryx-theme";
import { useUIStore } from "@/store/ui.store";

/**
 * Reads the persisted theme synchronously so the first client render already
 * matches what `noFlashThemeScript` (src/app/layout.tsx) applied to <html>
 * before paint. Astryx's <Theme> drives component colors via CSS
 * `color-scheme` (not the `data-theme` attribute), so without this, Astryx
 * components would still flash light-then-dark even though the script fixed
 * every plain Tailwind `dark:` class.
 */
function readPersistedTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const raw = window.localStorage.getItem("editdocsnow-ui");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.state?.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((state) => state.theme);
  const [initialTheme] = useState(readPersistedTheme);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  return (
    <Theme theme={editDocsNowTheme} mode={hasMounted ? theme : initialTheme}>
      {children}
    </Theme>
  );
}
