import { useEffect, useRef } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  enabled: boolean = true
) {
  // Use ref to avoid effect cleanup/setup on every render
  const latestShortcuts = useRef(shortcuts);
  latestShortcuts.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore input elements to prevent taking over typing
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Esc to always work (e.g. to close modals)
      if (isInput && e.key !== "Escape") return;

      const isCtrlPressed = e.ctrlKey || e.metaKey;

      for (const shortcut of latestShortcuts.current) {
        // Strict matching for modifiers
        const reqCtrl = !!shortcut.ctrl;
        const reqShift = !!shortcut.shift;
        const reqAlt = !!shortcut.alt;

        const ctrlOk = reqCtrl === isCtrlPressed;
        const shiftOk = reqShift === e.shiftKey;
        const altOk = reqAlt === e.altKey;
        const keyOk = shortcut.key.toLowerCase() === e.key.toLowerCase();

        if (ctrlOk && shiftOk && altOk && keyOk) {
          e.preventDefault();
          shortcut.action();
          break; // Execute only one shortcut
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return shortcuts;
}
