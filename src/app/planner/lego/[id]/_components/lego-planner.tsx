'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { Planner, Assignment, Project, SetAssignment } from '@/lib/types';
import { CalendarNavigation } from '@/app/planner/lego/[id]/_components/calendar-navigation';
import { generateWeeks } from '@/lib/dates';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from '@/components/week-block';
import { AssigneeFilter } from '@/app/planner/lego/[id]/_components/assignee-filter';
import { Button } from '@/components/ui/button';

import { parseAsInteger, useQueryState } from 'nuqs';
import { getAllAvailableProjects, isDefaultProject, DEFAULT_PROJECTS } from '@/lib/constants/default-projects';
import { ClipboardPasteIcon, CopyIcon, ScissorsIcon, TrashIcon, XIcon } from 'lucide-react';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';

// Utility imports
import {
  isCurrentWeek,
  isCurrentDate,
  getCurrentDayPositionInWeek,
  getCurrentTimePositionInDay,
} from '@/lib/utils/date-time';
import { getRoleSortPriority } from '@/lib/utils/sorting';

import { getProjectIcon } from '@/lib/utils/icons';
import { getThemeAwarePaintCursor, getThemeAwareEraseCursor } from '@/lib/utils/cursor';
import { generateAssigneeKey, parseAssigneeKey } from './utils/assignee';

// Component imports
import { AssigneeName } from './assignee-name';
import { WeekHeader } from './week-header';
import { CurrentTimeMarker } from './current-time-marker';
import { PlannerToolbar, usePlannerToolbarMode } from './planner-toolbar';

// Hook imports
import { useColumnSizing } from './hooks/use-column-sizing';
import { usePaintMode } from './hooks/use-paint-mode';
import { DragSelectTableCell, DragSelectTableContainer, useDragSelectState } from '@/components/ui/table-drag-select';
import { useHistory } from './hooks/use-history';
import { usePlannerClipboard } from './hooks/use-planner-clipboard';
import { usePlannerKeyboardShortcuts } from './hooks/use-planner-keyboard-shortcuts';
import { toast } from '@/components/ui/use-toast';
import { trpc } from '@/utils/trpc';

interface LegoPlannerProps {
  initialData: Planner;
  getAssignmentsForWeekAndAssignee: (weekNumber: number, assigneeId: string) => Assignment | undefined;
  onProjectClick?: (project: Project) => void;
}

export function LegoPlanner({
  initialData: plannerData,
  getAssignmentsForWeekAndAssignee,
  onProjectClick,
}: LegoPlannerProps) {
  const assignMutation = trpc.assignment.assign.useMutation({
    onSuccess: () => {},
    onError: (error) => {
      toast({
        title: 'Failed to assign projects',
        description: error.message || 'Failed to assign projects',
        variant: 'destructive',
      });
    },
  });

  const [currentYear, setCurrentYear] = useQueryState('year', parseAsInteger.withDefault(2025));
  const [currentQuarter, setCurrentQuarter] = useQueryState('quarter', parseAsInteger.withDefault(2));
  const [hoveredProjectId, setHoveredProjectId] = useState<string | undefined>(undefined);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  const { selectedSize, columnWidth } = useColumnSizing();

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const getAssignment = useCallback(
    (weekNumber: number, assigneeId: string) => {
      return (
        getAssignmentsForWeekAndAssignee(weekNumber, assigneeId) ?? {
          assigneeId,
          week: weekNumber,
          year: currentYear,
          quarter: currentQuarter,
          projectId: null,
        }
      );
    },
    [getAssignmentsForWeekAndAssignee, currentYear, currentQuarter],
  );

  // Memoized computed values
  const weekColumns = useMemo(() => generateWeeks(currentYear, currentQuarter), [currentYear, currentQuarter]);
  console.log(
    'weekColumns for Q',
    currentQuarter,
    currentYear,
    ':',
    weekColumns.map((w) => w.weekNumber),
  );

  const allAvailableProjects = useMemo(() => {
    return getAllAvailableProjects(plannerData.projects);
  }, [plannerData.projects]);

  const regularProjects = useMemo(() => {
    return plannerData.projects.filter((p) => !isDefaultProject(p.id));
  }, [plannerData.projects]);

  const defaultProjects = useMemo(() => {
    return DEFAULT_PROJECTS;
  }, []);

  const filteredAssignees = useMemo(() => {
    return selectedAssigneeIds.length > 0
      ? plannerData.assignees.filter((a) => selectedAssigneeIds.includes(a.id))
      : plannerData.assignees;
  }, [plannerData.assignees, selectedAssigneeIds]);

  const sortedAssignees = useMemo(() => {
    return [...filteredAssignees].sort((a, b) => {
      const aPriority = getRoleSortPriority(a.role);
      const bPriority = getRoleSortPriority(b.role);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.name.localeCompare(b.name);
    });
  }, [filteredAssignees]);

  // Memoized event handlers
  const handleYearChange = useCallback(
    (year: number) => {
      setCurrentYear(year);
    },
    [setCurrentYear],
  );

  const handleQuarterChange = useCallback(
    (quarter: number) => {
      setCurrentQuarter(quarter);
    },
    [setCurrentQuarter],
  );

  const [mode] = usePlannerToolbarMode();

  // History buffer for undo/redo
  const { canUndo, canRedo, addAction, undo, redo } = useHistory(10);

  // Wrap assignment actions to buffer them
  const handleHistoricAssign = useCallback(
    async (newAssignments: SetAssignment[], oldAssignments: SetAssignment[]) => {
      // Save action to history
      addAction({
        payload: {
          before: oldAssignments,
          after: newAssignments,
        },
      });
      await assignMutation.mutateAsync({
        assignments: newAssignments.map((cell) => ({
          ...cell,
          projectId: cell.projectId,
          status: 'planned',
        })),
        plannerId: plannerData.id,
      });
    },
    [addAction, assignMutation, plannerData.id],
  );

  // Undo/redo logic (to be wired to toolbar and shortcuts)
  const handleUndo = useCallback(async () => {
    const lastAction = undo();
    if (!lastAction) return;

    const { before } = lastAction.payload;

    await assignMutation.mutateAsync({
      assignments: before,
      plannerId: plannerData.id,
    });
  }, [undo, assignMutation, plannerData.id]);

  const handleRedo = useCallback(async () => {
    const nextAction = redo();
    if (!nextAction) return;

    const { after } = nextAction.payload;
    await assignMutation.mutateAsync({
      assignments: after,
      plannerId: plannerData.id,
    });
  }, [redo, assignMutation, plannerData.id]);

  // Clipboard functionality
  const { copy, cut, paste, canPaste, cutCells } = usePlannerClipboard({
    getAssignment,
    onHistoricAssign: handleHistoricAssign,
  });

  const handleFinishPainting = useCallback(
    async (cellIds: string[], paintProjectId: string | null) => {
      const cells = cellIds.map(parseAssigneeKey).map(({ assigneeId, weekNumber }) => ({
        assigneeId,
        week: weekNumber,
        year: currentYear,
        quarter: currentQuarter,
      }));

      if (mode === 'erase') {
        const oldAssignments = cellIds
          .map(parseAssigneeKey)
          .map(({ assigneeId, weekNumber }) => getAssignment(weekNumber, assigneeId));
        await handleHistoricAssign(
          cells.map((cell) => ({ ...cell, projectId: null })),
          oldAssignments,
        );
      } else if (mode === 'paint' && paintProjectId) {
        const oldAssignments = cellIds
          .map(parseAssigneeKey)
          .map(({ assigneeId, weekNumber }) => getAssignment(weekNumber, assigneeId));

        await handleHistoricAssign(
          cells.map((cell) => ({ ...cell, projectId: paintProjectId })),
          oldAssignments,
        );
      }
    },
    [currentQuarter, currentYear, getAssignment, mode, handleHistoricAssign],
  );

  const { paintProjectId, paintedCells, handleProjectSelect, startPainting, paint, stopPainting } = usePaintMode({
    mode,
    onPaintingFinished: handleFinishPainting,
  });

  const handleMouseEnterCell = useCallback(
    (projectId?: string) => {
      if (mode !== 'inspect') {
        return;
      }

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (projectId) {
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredProjectId(projectId);
        }, 300);
      }
    },
    [mode],
  );

  const handleMouseLeaveCell = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredProjectId(undefined);
  }, []);

  const handleAssigneesChange = useCallback((assigneeIds: string[]) => {
    setSelectedAssigneeIds(assigneeIds);
  }, []);

  // Paint mode handlers
  const handleCellMouseDown = useCallback(
    (assigneeId: string, weekNumber: number) => {
      startPainting();
      paint(generateAssigneeKey(assigneeId, weekNumber));
    },
    [paint, startPainting],
  );

  const handleCellMouseEnter = useCallback(
    (assigneeId: string, weekNumber: number) => {
      paint(generateAssigneeKey(assigneeId, weekNumber));
    },
    [paint],
  );

  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  // Get cursor style based on mode
  const cursorStyle = useMemo(() => {
    if (mode === 'paint' && paintProjectId) {
      return { cursor: getThemeAwarePaintCursor() };
    } else if (mode === 'erase') {
      return { cursor: getThemeAwareEraseCursor() };
    }
    return {};
  }, [mode, paintProjectId]);

  const handleCellClick = useCallback(
    (project?: Project) => {
      if (mode === 'inspect' && project && onProjectClick) {
        onProjectClick(project);
      }
    },
    [mode, onProjectClick],
  );

  // Clipboard operation handlers
  const handleCopy = useCallback(() => {
    copy(selectedCells);
    setSelectedCells([]);
  }, [copy, selectedCells]);

  const handleCut = useCallback(() => {
    cut(selectedCells);
    setSelectedCells([]);
  }, [cut, selectedCells]);

  const handlePaste = useCallback(async () => {
    if (selectedCells.length > 0) {
      try {
        await paste(selectedCells, currentYear, currentQuarter);
        setSelectedCells([]);
      } catch (error) {
        console.error('Error pasting assignments:', error);
        toast({
          title: 'Error pasting assignments',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    }
  }, [paste, selectedCells, currentYear, currentQuarter]);

  // Keyboard shortcuts for undo/redo and clipboard operations
  usePlannerKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onCut: handleCut,
    onPaste: handlePaste,
    canPaste,
    hasSelection: selectedCells.length > 0,
  });

  const handleAssignProjectFromSelectionPopover = useCallback(
    async (projectId: string) => {
      try {
        // Clear selection after assignment
        setSelectedCells([]);

        // Parse selected items to get assignee and week info
        if (selectedCells.length > 0) {
          const oldAssignments = selectedCells
            .map(parseAssigneeKey)
            .map(({ assigneeId, weekNumber }) => getAssignment(weekNumber, assigneeId));

          const cells = selectedCells.map(parseAssigneeKey).map(({ assigneeId, weekNumber }) => ({
            assigneeId,
            week: weekNumber,
            year: currentYear,
            quarter: currentQuarter,
          }));

          await handleHistoricAssign(
            cells.map((cell) => ({ ...cell, projectId })),
            oldAssignments,
          );
        }
      } catch (error) {
        console.error('Error assigning project:', error);
        toast({
          title: 'Error assigning project',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    },
    [selectedCells, handleHistoricAssign, getAssignment, currentYear, currentQuarter],
  );

  const handleDeleteAssignmentsFromSelectionPopover = useCallback(async () => {
    try {
      // Clear selection after assignment
      setSelectedCells([]);
      // Parse selected items and collect existing assignment IDs

      if (selectedCells.length > 0) {
        const oldAssignments = selectedCells
          .map(parseAssigneeKey)
          .map(({ assigneeId, weekNumber }) => getAssignment(weekNumber, assigneeId));

        const cells = selectedCells.map(parseAssigneeKey).map(({ assigneeId, weekNumber }) => ({
          assigneeId,
          week: weekNumber,
          year: currentYear,
          quarter: currentQuarter,
        }));

        await handleHistoricAssign(
          cells.map((cell) => ({ ...cell, projectId: null })),
          oldAssignments,
        );
      }
    } catch (error) {
      console.error('Error deleting assignments:', error);
      toast({
        title: 'Error deleting assignments',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  }, [getAssignment, handleHistoricAssign, selectedCells, currentYear, currentQuarter]);

  return (
    <>
      <p className="text-muted-foreground mt-1 text-xs">
        Weekly planning board - {weekColumns.length} weeks, {plannerData.assignees.length} assignees
      </p>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div className="flex items-center gap-4">
          <PlannerToolbar
            selectedProjectId={paintProjectId}
            onProjectSelect={handleProjectSelect}
            regularProjects={regularProjects}
            defaultProjects={defaultProjects}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            // TODO: Implement static toolbar methods to work with for cut / copy / paste that should be active based on the selection
          />
        </div>

        <CalendarNavigation
          currentYear={currentYear}
          currentQuarter={currentQuarter}
          onYearChange={handleYearChange}
          onQuarterChange={handleQuarterChange}
        />
      </div>

      <DragSelectTableContainer onSelectedItemsChange={setSelectedCells}>
        {mode === 'pointer' && (
          <SelectionActionPopover
            selectedItems={selectedCells}
            regularProjects={regularProjects}
            defaultProjects={defaultProjects}
            onClearSelection={() => setSelectedCells([])}
            onAssignProject={handleAssignProjectFromSelectionPopover}
            onDeleteAssignments={handleDeleteAssignmentsFromSelectionPopover}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            canPaste={canPaste}
          />
        )}
        <div style={cursorStyle} onMouseUp={stopPainting}>
          <table ref={tableRef} className={cn('w-full caption-bottom text-sm table-fixed border-collapse select-none')}>
            <TableHeader>
              <TableRow>
                <TableHead className="p-0 min-w-[200px] w-[200px] border-r dark:border-zinc-700 sticky left-0 top-0 z-30 bg-background dark:bg-zinc-900">
                  <div className="h-7 flex items-center justify-center px-1 text-xs">
                    <AssigneeFilter
                      assignees={plannerData.assignees}
                      selectedAssigneeIds={selectedAssigneeIds}
                      onAssigneesChange={handleAssigneesChange}
                    />
                  </div>
                </TableHead>
                {weekColumns.map((week) => {
                  const isCurrentWeekCell = isCurrentWeek(week.startDate, week.endDate);
                  const isCurrentDateCell = isCurrentDate(week.startDate, week.endDate);
                  const dayPosition = isCurrentDateCell ? getCurrentDayPositionInWeek(week.startDate) : 0;
                  const timePosition = isCurrentDateCell ? getCurrentTimePositionInDay() : 0;
                  const markerPosition = ((dayPosition + timePosition) / 7) * 100;

                  return (
                    <WeekHeader
                      key={week.weekNumber}
                      week={week}
                      columnWidth={columnWidth}
                      isCurrentWeek={isCurrentWeekCell}
                      isCurrentDate={isCurrentDateCell}
                      markerPosition={markerPosition}
                    />
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssignees.map((assignee) => (
                <TableRow key={assignee.id}>
                  <TableCell className="p-0 font-medium border-r dark:border-zinc-700 sticky left-0 top-0 z-30 bg-background">
                    <AssigneeName assignee={assignee} />
                  </TableCell>
                  {weekColumns.map((weekCol) => {
                    const assignment = getAssignmentsForWeekAndAssignee(weekCol.weekNumber, assignee.id);
                    const project = assignment
                      ? allAvailableProjects.find((p) => p.id === assignment.projectId)
                      : undefined;

                    const isCurrentWeekCell = isCurrentWeek(weekCol.startDate, weekCol.endDate);
                    const isCurrentDateCell = isCurrentDate(weekCol.startDate, weekCol.endDate);
                    const dayPosition = isCurrentDateCell ? getCurrentDayPositionInWeek(weekCol.startDate) : 0;
                    const timePosition = isCurrentDateCell ? getCurrentTimePositionInDay() : 0;
                    const markerPosition = ((dayPosition + timePosition) / 7) * 100;

                    const CellComponent = mode === 'pointer' ? DragSelectTableCell : TableCell;
                    const isPainting = mode === 'paint' || mode === 'erase';

                    const cellKey = generateAssigneeKey(assignee.id, weekCol.weekNumber);
                    const isCutCell = cutCells.includes(cellKey);

                    return (
                      <CellComponent
                        key={weekCol.weekNumber}
                        id={cellKey}
                        className={cn(
                          'p-0 h-8 border-r dark:border-zinc-700 last:border-r-0 transition-opacity duration-300 relative',
                          mode === 'inspect' &&
                            hoveredProjectId &&
                            project &&
                            project.id !== hoveredProjectId &&
                            'opacity-30',
                          isCurrentWeekCell && 'bg-amber-50/20 dark:bg-amber-950/10',
                          mode === 'inspect' && project && 'cursor-pointer',
                          isCutCell && 'opacity-50 border-dashed border-2 border-orange-400',
                        )}
                        onPointerOver={() => handleMouseEnterCell(project?.id)}
                        onPointerEnter={() => {
                          handleCellMouseEnter(assignee.id, weekCol.weekNumber);
                        }}
                        onPointerLeave={handleMouseLeaveCell}
                        onPointerDown={() => handleCellMouseDown(assignee.id, weekCol.weekNumber)}
                        onClick={() => handleCellClick(project)}
                      >
                        {isPainting && paintedCells.has(generateAssigneeKey(assignee.id, weekCol.weekNumber)) ? (
                          <WeekBlock project={allAvailableProjects.find((project) => project.id === paintProjectId)} />
                        ) : (
                          <WeekBlock project={project} isCompact={selectedSize === 'compact'} />
                        )}
                        {isCurrentDateCell && <CurrentTimeMarker markerPosition={markerPosition} />}
                      </CellComponent>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </DragSelectTableContainer>
    </>
  );
}

function SelectionActionPopover({
  selectedItems,
  regularProjects,
  defaultProjects,
  onClearSelection,
  onAssignProject,
  onDeleteAssignments,
  onCopy,
  onCut,
  onPaste,
  canPaste,
}: {
  selectedItems: string[];
  regularProjects: Project[];
  defaultProjects: Project[];
  onClearSelection: () => void;
  onAssignProject: (projectId: string) => Promise<void>;
  onDeleteAssignments: () => Promise<void>;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => Promise<void>;
  canPaste: boolean;
}) {
  const { finalDragPosition } = useDragSelectState();

  if (selectedItems.length === 0 || !finalDragPosition) {
    return null;
  }

  // Calculate position to avoid going off-screen
  const offsetX = 10;
  const offsetY = 10;
  const popoverWidth = 300; // Match the actual maxWidth
  const popoverHeight = 200; // Taller for action bar content

  const left =
    finalDragPosition.x + offsetX + popoverWidth > window.innerWidth
      ? finalDragPosition.x - popoverWidth + offsetX // Position to the left, but closer to cursor
      : finalDragPosition.x + offsetX;

  const top =
    finalDragPosition.y + offsetY + popoverHeight > window.innerHeight
      ? finalDragPosition.y - popoverHeight - offsetY
      : finalDragPosition.y + offsetY;

  return (
    <div
      data-no-drag-select
      className="fixed flex flex-col pointer-events-auto z-50 bg-popover border border-border rounded-lg shadow-lg"
      style={{
        left: Math.max(10, left),
        top: Math.max(10, top),
        // minWidth: '350px',
        maxWidth: '300px',
      }}
    >
      {/* Header with selection count and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <Button variant="ghost" className="h-8" onClick={onCut} disabled={selectedItems.length === 0}>
              <ScissorsIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-8" onClick={onCopy} disabled={selectedItems.length === 0}>
              <CopyIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8"
              onClick={onPaste}
              disabled={!canPaste || selectedItems.length === 0}
            >
              <ClipboardPasteIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 text-destructive hover:text-destructive"
              onClick={onDeleteAssignments}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" className="h-8" onClick={onClearSelection}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="border-t -mx-1" />
      {/* Project assignment section */}
      <div>
        <div className="max-h-96 overflow-y-auto overflow-x-hidden">
          {/* Regular projects */}
          {regularProjects.length > 0 && (
            <>
              {regularProjects.map((project) => {
                // Get project color for border
                const projectColor = getProjectColorByName(project.color) || getDefaultProjectColor();
                // Extract border class from the project color configuration
                const borderClass = projectColor.borderColor;

                return (
                  <div
                    key={project.id}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground relative overflow-hidden border-l-4 ${borderClass}`}
                    onClick={() => onAssignProject(project.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10">
                      {getProjectIcon(project.type)}
                      <span className="truncate font-normal">
                        <span className="text-muted-foreground">{project.slug}:</span> {project.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Default projects */}
          {defaultProjects.length > 0 && (
            <>
              {regularProjects.length > 0 && <div className="border-t -mx-1" />}
              {defaultProjects.map((project) => {
                // Get project color for border
                const projectColor = getProjectColorByName(project.color) || getDefaultProjectColor();
                // Extract border class from the project color configuration
                const borderClass = projectColor.borderColor;

                return (
                  <div
                    key={project.id}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground relative overflow-hidden border-l-4 ${borderClass}`}
                    onClick={() => onAssignProject(project.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10">
                      {getProjectIcon(project.type)}
                      <span className="truncate text-muted-foreground font-normal">
                        <span className="text-muted-foreground/70">{project.slug}:</span> {project.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
