import { useEffect } from 'react';

export type PlannerMode = 'pointer' | 'paint' | 'erase' | 'inspect';

interface ToolbarKeyboardShortcutsConfig {
  onModeChange: (mode: PlannerMode) => void;
  currentMode: PlannerMode;
  isProjectSelectorOpen: boolean;
  onProjectSelectorToggle: (open: boolean) => void;
  onProjectNavigate: (direction: 'up' | 'down') => void;
  onProjectSelect: () => void;
  onProjectSelectorEscape: () => void;
}

// Physical key codes for cross-language compatibility
const KEY_CODES = {
  // Mode selection
  V: 'KeyV',
  B: 'KeyB',
  E: 'KeyE',
  I: 'KeyI',
  // Navigation
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
} as const;

export function useToolbarKeyboardShortcuts({
  onModeChange,
  currentMode,
  isProjectSelectorOpen,
  onProjectSelectorToggle,
  onProjectNavigate,
  onProjectSelect,
  onProjectSelectorEscape,
}: ToolbarKeyboardShortcutsConfig) {
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

      // Project selector navigation (when open) - highest priority
      if (isProjectSelectorOpen) {
        switch (event.code) {
          case KEY_CODES.ARROW_DOWN:
            event.preventDefault();
            onProjectNavigate('down');
            return;
          case KEY_CODES.ARROW_UP:
            event.preventDefault();
            onProjectNavigate('up');
            return;
          case KEY_CODES.ENTER:
            event.preventDefault();
            onProjectSelect();
            return;
          case KEY_CODES.ESCAPE:
            event.preventDefault();
            onProjectSelectorEscape();
            return;
        }
      }

      // Mode selection shortcuts (only for non-Cmd/Ctrl keys)
      // These should work even when project selector is open to allow mode switching
      if (!isCmdOrCtrl) {
        switch (event.code) {
          case KEY_CODES.V:
            event.preventDefault();
            onModeChange('pointer');
            // Close project selector when switching away from paint mode
            if (isProjectSelectorOpen) {
              onProjectSelectorToggle(false);
            }
            return;
          case KEY_CODES.B:
            event.preventDefault();
            onModeChange('paint');
            onProjectSelectorToggle(true);
            return;
          case KEY_CODES.E:
            event.preventDefault();
            onModeChange('erase');
            // Close project selector when switching away from paint mode
            if (isProjectSelectorOpen) {
              onProjectSelectorToggle(false);
            }
            return;
          case KEY_CODES.I:
            event.preventDefault();
            onModeChange('inspect');
            // Close project selector when switching away from paint mode
            if (isProjectSelectorOpen) {
              onProjectSelectorToggle(false);
            }
            return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    onModeChange,
    currentMode,
    isProjectSelectorOpen,
    onProjectSelectorToggle,
    onProjectNavigate,
    onProjectSelect,
    onProjectSelectorEscape,
  ]);
}
