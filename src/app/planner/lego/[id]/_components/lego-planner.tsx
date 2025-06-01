'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { Planner, Assignment, Project } from '@/lib/types';
import { CalendarNavigation } from '@/app/planner/lego/[id]/_components/calendar-navigation';
import { generateWeeks } from '@/lib/sample-data';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from '@/components/week-block';
import { AssigneeFilter } from '@/app/planner/lego/[id]/_components/assignee-filter';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
import { ColumnSizeType } from '@/lib/utils/column-sizing';
import { getProjectIcon } from '@/lib/utils/icons';

// Component imports
import { AssigneeName } from './assignee-name';
import { WeekHeader } from './week-header';
import { CurrentTimeMarker } from './current-time-marker';

// Hook imports
import { useColumnSizing } from './hooks/use-column-sizing';
import { DragSelectTableCell, DragSelectTableContainer, useDragSelectState } from '@/components/ui/table-drag-select';

interface LegoPlannerProps {
  initialData: Planner;
  getAssignmentsForWeekAndAssignee: (weekNumber: number, assigneeId: string) => Assignment | undefined;
  onCreateAssignment?: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  onUpdateAssignment?: (assignment: Partial<Assignment>) => Promise<void>;
  onDeleteAssignment?: (assignmentId: string) => Promise<void>;
  onBulkUpsertAssignments?: (
    assignmentData: Array<{
      assigneeId: string;
      week: number;
      projectId: string;
      plannerId: string;
      year: number;
      quarter: number;
      status?: string;
    }>,
  ) => Promise<void>;
  onBulkDeleteAssignments?: (assignmentIds: string[]) => Promise<void>;
}

export function LegoPlanner({
  initialData: plannerData,
  getAssignmentsForWeekAndAssignee,
  onBulkUpsertAssignments,
  onBulkDeleteAssignments,
}: LegoPlannerProps) {
  const [currentYear, setCurrentYear] = useQueryState('year', parseAsInteger.withDefault(2025));
  const [currentQuarter, setCurrentQuarter] = useQueryState('quarter', parseAsInteger.withDefault(2));
  const [hoveredProjectId, setHoveredProjectId] = useState<string | undefined>(undefined);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  const { selectedSize, setColumnSize, columnWidth, resetColumnSize } = useColumnSizing();

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Memoized computed values
  const weeks = useMemo(() => generateWeeks(currentYear, currentQuarter), [currentYear, currentQuarter]);

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

  const handleMouseEnterCell = useCallback((projectId?: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (projectId) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredProjectId(projectId);
      }, 1500);
    }
  }, []);

  const handleMouseLeaveCell = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredProjectId(undefined);
  }, []);

  const handleAssigneesChange = useCallback((assigneeIds: string[]) => {
    setSelectedAssigneeIds(assigneeIds);
  }, []);

  const handleColumnSizeChange = useCallback(
    (value: string | undefined) => {
      if (value) {
        setColumnSize(value as ColumnSizeType);
      }
    },
    [setColumnSize],
  );

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div>
          <h1 className="text-lg text-foreground">Lego Planner</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Weekly planning board - {weeks.length} weeks, {plannerData.assignees.length} assignees
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ToggleGroup
              type="single"
              variant="outline"
              value={selectedSize}
              onValueChange={handleColumnSizeChange}
              className="h-7"
            >
              <ToggleGroupItem value="compact" className="text-xs px-2">
                Compact
              </ToggleGroupItem>
              <ToggleGroupItem value="normal" className="text-xs px-2">
                Normal
              </ToggleGroupItem>
              <ToggleGroupItem value="wide" className="text-xs px-2">
                Wide
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={resetColumnSize}>
              Reset
            </Button>
          </div>
          <CalendarNavigation
            currentYear={currentYear}
            currentQuarter={currentQuarter}
            onYearChange={handleYearChange}
            onQuarterChange={handleQuarterChange}
          />
        </div>
      </div>

      <DragSelectTableContainer onSelectedItemsChange={setSelectedItems}>
        <SelectionActionPopover
          selectedItems={selectedItems}
          regularProjects={regularProjects}
          defaultProjects={defaultProjects}
          onClearSelection={() => setSelectedItems([])}
          onAssignProject={async (projectId: string) => {
            if (!onBulkUpsertAssignments) return;

            try {
              // Clear selection after assignment
              setSelectedItems([]);
              // Parse selected items to get assignee and week info
              const assignmentData: Array<{
                assigneeId: string;
                week: number;
                projectId: string;
                plannerId: string;
                year: number;
                quarter: number;
                status?: string;
              }> = [];

              for (const itemId of selectedItems) {
                const parts = itemId.split('-');
                if (parts.length !== 2) continue;

                const assigneeId = parts[0]!;
                const weekStr = parts[1]!;
                const week = parseInt(weekStr, 10);

                if (!assigneeId || !weekStr || isNaN(week)) continue;

                assignmentData.push({
                  assigneeId,
                  projectId,
                  plannerId: plannerData.id,
                  week,
                  year: currentYear,
                  quarter: currentQuarter,
                  status: 'planned',
                });
              }

              if (assignmentData.length > 0) {
                await onBulkUpsertAssignments(assignmentData);
              }
            } catch (error) {
              console.error('Error assigning project:', error);
            }
          }}
          onDeleteAssignments={async () => {
            if (!onBulkDeleteAssignments) return;

            try {
              // Clear selection after assignment
              setSelectedItems([]);
              // Parse selected items and collect existing assignment IDs
              const assignmentIds: string[] = [];

              for (const itemId of selectedItems) {
                const parts = itemId.split('-');
                if (parts.length !== 2) continue;

                const assigneeId = parts[0]!;
                const weekStr = parts[1]!;
                const week = parseInt(weekStr, 10);

                if (!assigneeId || !weekStr || isNaN(week)) continue;

                const existingAssignment = getAssignmentsForWeekAndAssignee(week, assigneeId);
                if (existingAssignment) {
                  assignmentIds.push(existingAssignment.id);
                }
              }

              if (assignmentIds.length > 0) {
                await onBulkDeleteAssignments(assignmentIds);
              }
            } catch (error) {
              console.error('Error deleting assignments:', error);
            }
          }}
        />
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
              {weeks.map((week) => {
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
                {weeks.map((week) => {
                  const assignment = getAssignmentsForWeekAndAssignee(week.weekNumber, assignee.id);
                  const project = assignment
                    ? allAvailableProjects.find((p) => p.id === assignment.projectId)
                    : undefined;

                  const isCurrentWeekCell = isCurrentWeek(week.startDate, week.endDate);
                  const isCurrentDateCell = isCurrentDate(week.startDate, week.endDate);
                  const dayPosition = isCurrentDateCell ? getCurrentDayPositionInWeek(week.startDate) : 0;
                  const timePosition = isCurrentDateCell ? getCurrentTimePositionInDay() : 0;
                  const markerPosition = ((dayPosition + timePosition) / 7) * 100;
                  const dataItemId = `${assignee.id}-${week.weekNumber}`;

                  return (
                    <DragSelectTableCell
                      key={week.weekNumber}
                      id={dataItemId}
                      className={cn(
                        'p-0 h-8 border-r dark:border-zinc-700 last:border-r-0 transition-opacity duration-300 relative',
                        hoveredProjectId && project && project.id !== hoveredProjectId && 'opacity-30',
                        isCurrentWeekCell && 'bg-amber-50/20 dark:bg-amber-950/10',
                      )}
                      style={{
                        minWidth: `${columnWidth}px`,
                        width: `${columnWidth}px`,
                        transition: 'width 0.2s ease-in-out',
                      }}
                      onMouseEnter={() => handleMouseEnterCell(project?.id)}
                      onMouseLeave={handleMouseLeaveCell}
                    >
                      <WeekBlock project={project} isCompact={selectedSize === 'compact'} />
                      {isCurrentDateCell && <CurrentTimeMarker markerPosition={markerPosition} />}
                    </DragSelectTableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </table>
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
}: {
  selectedItems: string[];
  regularProjects: Project[];
  defaultProjects: Project[];
  onClearSelection: () => void;
  onAssignProject: (projectId: string) => Promise<void>;
  onDeleteAssignments: () => Promise<void>;
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
            <Button variant="ghost" className="h-8">
              <ScissorsIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-8">
              <CopyIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-8">
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
                      <span className="truncate font-medium">
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
                      <span className="truncate text-muted-foreground font-medium">
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
