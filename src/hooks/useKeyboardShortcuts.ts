"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onSave?: () => void;
  onSearch?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

/** Registers Ctrl/Cmd+S (save), Ctrl/Cmd+F (search), Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z (redo). */
export function useKeyboardShortcuts({
  onSave,
  onSearch,
  onUndo,
  onRedo,
}: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifier = event.ctrlKey || event.metaKey;
      if (!isModifier) return;

      switch (event.key.toLowerCase()) {
        case "s":
          event.preventDefault();
          onSave?.();
          break;
        case "f":
          if (onSearch) {
            event.preventDefault();
            onSearch();
          }
          break;
        case "z":
          if (event.shiftKey) {
            if (onRedo) {
              event.preventDefault();
              onRedo();
            }
          } else if (onUndo) {
            event.preventDefault();
            onUndo();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onSearch, onUndo, onRedo]);
}
