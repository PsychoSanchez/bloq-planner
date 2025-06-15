import { SetAssignment } from '@/lib/types';
import { useCallback, useState } from 'react';

export type AssignmentAction = {
  payload: {
    before: SetAssignment[];
    after: SetAssignment[];
  };
};

interface UseHistoryResult {
  history: AssignmentAction[];
  pointer: number;
  canUndo: boolean;
  canRedo: boolean;
  addAction: (action: AssignmentAction) => void;
  undo: () => AssignmentAction | undefined;
  redo: () => AssignmentAction | undefined;
  clear: () => void;
}

export function useHistory(maxLength = 10): UseHistoryResult {
  const [history, setHistory] = useState<AssignmentAction[]>([]);
  const [pointer, setPointer] = useState(-1);
  const maxLen = maxLength;

  const addAction = useCallback(
    (action: AssignmentAction) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, pointer + 1).concat(action);
        if (newHistory.length > maxLen) {
          newHistory.shift();
        }
        return newHistory;
      });
      setPointer((prev) => Math.min(prev + 1, maxLen - 1));
    },
    [pointer, maxLen],
  );

  const undo = useCallback(() => {
    if (pointer >= 0) {
      setPointer((prev) => prev - 1);
      return history[pointer];
    }
    return undefined;
  }, [pointer, history]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      setPointer((prev) => prev + 1);
      return history[pointer + 1];
    }
    return undefined;
  }, [pointer, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setPointer(-1);
  }, []);

  return {
    history,
    pointer,
    canUndo: pointer >= 0,
    canRedo: pointer < history.length - 1,
    addAction,
    undo,
    redo,
    clear,
  };
}
