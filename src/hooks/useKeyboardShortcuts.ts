"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onSave?: () => void;
  onSearch?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEscape?: () => void;
}

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable;
}

/**
 * Registers Ctrl/Cmd+S (save), Ctrl/Cmd+F (search), Ctrl/Cmd+Z (undo),
 * Ctrl/Cmd+Shift+Z (redo), Delete/Backspace (remove selected object),
 * Ctrl/Cmd+D (duplicate selected object), Escape (deselect/cancel tool).
 * Delete/Backspace/Escape are ignored while focus is inside a text field so
 * normal typing (including editing a text object's own textarea) isn't
 * hijacked.
 */
export function useKeyboardShortcuts({
  onSave,
  onSearch,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onEscape,
}: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifier = event.ctrlKey || event.metaKey;

      if (isModifier) {
        switch (event.key.toLowerCase()) {
          case "s":
            event.preventDefault();
            onSave?.();
            return;
          case "f":
            if (onSearch) {
              event.preventDefault();
              onSearch();
            }
            return;
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
            return;
          case "d":
            if (onDuplicate) {
              event.preventDefault();
              onDuplicate();
            }
            return;
          default:
            return;
        }
      }

      if (isTypingInField(event.target)) return;

      if ((event.key === "Delete" || event.key === "Backspace") && onDelete) {
        event.preventDefault();
        onDelete();
      } else if (event.key === "Escape" && onEscape) {
        onEscape();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onSearch, onUndo, onRedo, onDelete, onDuplicate, onEscape]);
}
