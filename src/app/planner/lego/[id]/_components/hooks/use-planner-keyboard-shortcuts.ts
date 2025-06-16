import { useEffect } from 'react';

interface PlannerKeyboardShortcutsConfig {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => Promise<void>;
  canPaste: boolean;
  hasSelection: boolean;
}

// Physical key codes for cross-language compatibility
const KEY_CODES = {
  Z: 'KeyZ',
  C: 'KeyC',
  X: 'KeyX',
  V: 'KeyV',
} as const;

export function usePlannerKeyboardShortcuts({
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
  canPaste,
  hasSelection,
}: PlannerKeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      // Only handle Cmd/Ctrl shortcuts
      if (!isCmdOrCtrl) {
        return;
      }

      // Cmd+Z (undo)
      if (!event.shiftKey && event.code === KEY_CODES.Z) {
        event.preventDefault();
        onUndo();
        return;
      }

      // Cmd+Shift+Z (redo)
      if (event.shiftKey && event.code === KEY_CODES.Z) {
        event.preventDefault();
        onRedo();
        return;
      }

      // Cmd+C (copy)
      if (event.code === KEY_CODES.C && hasSelection) {
        event.preventDefault();
        onCopy();
        return;
      }

      // Cmd+X (cut)
      if (event.code === KEY_CODES.X && hasSelection) {
        event.preventDefault();
        onCut();
        return;
      }

      // Cmd+V (paste)
      if (event.code === KEY_CODES.V && canPaste && hasSelection) {
        event.preventDefault();
        onPaste();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onUndo, onRedo, onCopy, onCut, onPaste, canPaste, hasSelection]);
}
