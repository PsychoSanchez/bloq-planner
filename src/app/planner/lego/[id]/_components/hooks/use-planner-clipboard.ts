import { useState, useCallback } from 'react';
import { Assignment, SetAssignment } from '@/lib/types';
import { parseAssigneeKey } from '../utils/assignee';

export interface ClipboardData {
  assignments: Array<{ assigneeId: string; week: number; year: number; quarter: number; projectId: string | null }>;
  operation: 'copy' | 'cut';
}

export interface UsePlannerClipboardOptions {
  getAssignment: (
    weekNumber: number,
    assigneeId: string,
  ) =>
    | Assignment
    | (SetAssignment & { assigneeId: string; week: number; year: number; quarter: number; projectId: string | null });
  onHistoricAssign: (newAssignments: SetAssignment[], oldAssignments: SetAssignment[]) => Promise<void>;
}

export function usePlannerClipboard({ getAssignment, onHistoricAssign }: UsePlannerClipboardOptions) {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);
  const [cutCells, setCutCells] = useState<string[]>([]);

  const copy = useCallback(
    (selectedCells: string[]) => {
      if (selectedCells.length === 0) return;

      const assignments = selectedCells.map(parseAssigneeKey).map(({ assigneeId, weekNumber }) => {
        const assignment = getAssignment(weekNumber, assigneeId);
        return {
          assigneeId,
          week: weekNumber,
          year: assignment.year,
          quarter: assignment.quarter,
          projectId: assignment.projectId,
        };
      });

      setClipboardData({
        assignments,
        operation: 'copy',
      });

      // Clear any previous cut operation
      setCutCells([]);
    },
    [getAssignment],
  );

  const cut = useCallback(
    (selectedCells: string[]) => {
      if (selectedCells.length === 0) return;

      const assignments = selectedCells.map(parseAssigneeKey).map(({ assigneeId, weekNumber }) => {
        const assignment = getAssignment(weekNumber, assigneeId);
        return {
          assigneeId,
          week: weekNumber,
          year: assignment.year,
          quarter: assignment.quarter,
          projectId: assignment.projectId,
        };
      });

      setClipboardData({
        assignments,
        operation: 'cut',
      });

      // Store the cells that were cut for visual indication
      setCutCells(selectedCells);
    },
    [getAssignment],
  );

  const paste = useCallback(
    async (targetCells: string[], currentYear: number, currentQuarter: number) => {
      if (!clipboardData || targetCells.length === 0) return;

      const { assignments: sourceAssignments, operation } = clipboardData;

      if (sourceAssignments.length === 0) return;

      // Get current assignments for target cells (for history)
      const oldTargetAssignments = targetCells
        .map(parseAssigneeKey)
        .map(({ assigneeId, weekNumber }) => getAssignment(weekNumber, assigneeId));

      // Create new assignments for target cells
      const newTargetAssignments: SetAssignment[] = targetCells.map((cellId, index) => {
        const { assigneeId, weekNumber } = parseAssigneeKey(cellId);
        // Cycle through source assignments if target has more cells
        const sourceAssignment = sourceAssignments[index % sourceAssignments.length];

        return {
          assigneeId,
          week: weekNumber,
          year: currentYear,
          quarter: currentQuarter,
          projectId: sourceAssignment?.projectId || null,
        };
      });

      let allOldAssignments = [...oldTargetAssignments];
      let allNewAssignments = [...newTargetAssignments];

      // If this was a cut operation, also clear the source cells
      if (operation === 'cut' && cutCells.length > 0) {
        const oldSourceAssignments = cutCells
          .map(parseAssigneeKey)
          .map(({ assigneeId, weekNumber }) => getAssignment(weekNumber, assigneeId));

        const newSourceAssignments: SetAssignment[] = cutCells.map((cellId) => {
          const { assigneeId, weekNumber } = parseAssigneeKey(cellId);
          return {
            assigneeId,
            week: weekNumber,
            year: currentYear,
            quarter: currentQuarter,
            projectId: null, // Clear the source cells
          };
        });

        // Combine source and target changes for a single history entry
        allOldAssignments = [...oldSourceAssignments, ...oldTargetAssignments];
        allNewAssignments = [...newSourceAssignments, ...newTargetAssignments];

        // Clear cut state after paste
        setCutCells([]);
        setClipboardData(null);
      }

      // Apply all changes in a single historic action
      await onHistoricAssign(allNewAssignments, allOldAssignments);
    },
    [clipboardData, cutCells, getAssignment, onHistoricAssign],
  );

  const clearClipboard = useCallback(() => {
    setClipboardData(null);
    setCutCells([]);
  }, []);

  const hasClipboardData = Boolean(clipboardData);
  const canPaste = hasClipboardData;

  return {
    copy,
    cut,
    paste,
    clearClipboard,
    hasClipboardData,
    canPaste,
    cutCells,
    clipboardData,
  };
}
