'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { Planner, Assignment } from '@/lib/types';
import { CalendarNavigation } from '@/app/planner/lego/[id]/_components/calendar-navigation';
import { generateWeeks } from '@/lib/sample-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from '@/components/week-block';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AssigneeFilter } from '@/app/planner/lego/[id]/_components/assignee-filter';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { parseAsInteger, useQueryState } from 'nuqs';
import { getAllAvailableProjects, isDefaultProject, DEFAULT_PROJECTS } from '@/lib/constants/default-projects';
import { Target } from 'lucide-react';

// Utility imports
import {
  isCurrentWeek,
  isCurrentDate,
  getCurrentDayPositionInWeek,
  getCurrentTimePositionInDay,
} from '@/lib/utils/date-time';
import { getRoleSortPriority } from '@/lib/utils/sorting';
import { ColumnSizeType } from '@/lib/utils/column-sizing';

// Component imports
import { AssigneeName } from './assignee-name';
import { WeekHeader } from './week-header';
import { CurrentTimeMarker } from './current-time-marker';
import { AssignmentContextMenu } from './assignment-context-menu';

// Hook imports
import { useColumnSizing } from './hooks/use-column-sizing';

interface LegoPlannerProps {
  initialData: Planner;
  getAssignmentsForWeekAndAssignee: (weekNumber: number, assigneeId: string) => Assignment | undefined;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (assignmentId: string) => void;
}

export function LegoPlanner({
  initialData: plannerData,
  getAssignmentsForWeekAndAssignee,
  createAssignment,
  updateAssignment,
  deleteAssignment,
}: LegoPlannerProps) {
  const [currentYear, setCurrentYear] = useQueryState('year', parseAsInteger.withDefault(2025));
  const [currentQuarter, setCurrentQuarter] = useQueryState('quarter', parseAsInteger.withDefault(2));
  const [hoveredProjectId, setHoveredProjectId] = useState<string | undefined>(undefined);
  const [isInspectModeEnabled, setIsInspectModeEnabled] = useState<boolean>(false);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [highlightCurrentWeek, setHighlightCurrentWeek] = useState<boolean>(true);

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

  const currentWeekIndex = useMemo(() => {
    return weeks.findIndex((week) => isCurrentWeek(week.startDate, week.endDate));
  }, [weeks]);

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

  const handleMouseEnterCell = useCallback(
    (projectId?: string) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (projectId && isInspectModeEnabled) {
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredProjectId(projectId);
        }, 500);
      }
    },
    [isInspectModeEnabled],
  );

  const handleMouseLeaveCell = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredProjectId(undefined);
  }, []);

  const handleInspectToggle = useCallback((checked: boolean) => {
    setIsInspectModeEnabled(checked);
    if (!checked) {
      setHoveredProjectId(undefined);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    }
  }, []);

  const handleHighlightCurrentWeekToggle = useCallback((checked: boolean) => {
    setHighlightCurrentWeek(checked);
  }, []);

  const handleAssigneesChange = useCallback((assigneeIds: string[]) => {
    setSelectedAssigneeIds(assigneeIds);
  }, []);

  const scrollToCurrentWeek = useCallback(() => {
    if (currentWeekIndex >= 0 && tableRef.current) {
      const headerCells = tableRef.current.querySelectorAll('thead th');
      const targetCell = headerCells[currentWeekIndex + 1];
      if (targetCell) {
        targetCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentWeekIndex]);

  const handleColumnSizeChange = useCallback(
    (value: string | undefined) => {
      if (value) {
        setColumnSize(value as ColumnSizeType);
      }
    },
    [setColumnSize],
  );

  // Assignment handlers
  const createAssignmentHandler = useCallback(
    (assigneeId: string, projectId: string, weekNumber: number) => {
      createAssignment({
        assigneeId,
        projectId,
        plannerId: plannerData.id,
        week: weekNumber,
        year: currentYear,
        quarter: currentQuarter,
      });
    },
    [createAssignment, plannerData.id, currentYear, currentQuarter],
  );

  const updateAssignmentHandler = useCallback(
    (assignment: Assignment, projectId: string) => {
      updateAssignment({
        ...assignment,
        projectId,
      });
    },
    [updateAssignment],
  );

  const handleAssignProject = useCallback(
    (assignment: Assignment | undefined, assigneeId: string, projectId: string, weekNumber: number) => {
      if (assignment) {
        updateAssignmentHandler(assignment, projectId);
      } else {
        createAssignmentHandler(assigneeId, projectId, weekNumber);
      }
    },
    [updateAssignmentHandler, createAssignmentHandler],
  );

  const handleDeleteAssignment = useCallback(
    (assignmentId: string) => {
      deleteAssignment(assignmentId);
    },
    [deleteAssignment],
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div>
          <h1 className="text-lg text-foreground">Lego Planner</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Weekly planning board - {weeks.length} weeks, {plannerData.assignees.length} assignees
          </p>
        </div>
        <div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="inspect-mode" checked={isInspectModeEnabled} onCheckedChange={handleInspectToggle} />
              <Label htmlFor="inspect-mode" className="text-xs text-muted-foreground">
                Inspect
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="highlight-current"
                checked={highlightCurrentWeek}
                onCheckedChange={handleHighlightCurrentWeekToggle}
              />
              <Label htmlFor="highlight-current" className="text-xs text-muted-foreground">
                Current Week
              </Label>
            </div>
            {currentWeekIndex >= 0 && (
              <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={scrollToCurrentWeek}>
                <Target className="h-3 w-3 mr-1" />
                Go to Current
              </Button>
            )}
            <div className="flex items-center gap-1">
              <ToggleGroup type="single" value={selectedSize} onValueChange={handleColumnSizeChange} className="h-7">
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
      </div>

      <Table className="border-collapse overflow-scroll" ref={tableRef}>
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
                  highlightCurrentWeek={highlightCurrentWeek}
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

                return (
                  <TableCell
                    key={week.weekNumber}
                    className={cn(
                      'p-0 h-8 border-r dark:border-zinc-700 last:border-r-0 transition-opacity duration-300 relative',
                      hoveredProjectId && project && project.id !== hoveredProjectId && 'opacity-30',
                      highlightCurrentWeek && isCurrentWeekCell && 'bg-amber-50/20 dark:bg-amber-950/10',
                    )}
                    style={{
                      minWidth: `${columnWidth}px`,
                      width: `${columnWidth}px`,
                      transition: 'width 0.2s ease-in-out',
                    }}
                    onMouseEnter={() => handleMouseEnterCell(project?.id)}
                    onMouseLeave={handleMouseLeaveCell}
                  >
                    <AssignmentContextMenu
                      assignment={assignment}
                      regularProjects={regularProjects}
                      defaultProjects={defaultProjects}
                      onAssignProject={(projectId) =>
                        handleAssignProject(assignment, assignee.id, projectId, week.weekNumber)
                      }
                      onDeleteAssignment={() => assignment && handleDeleteAssignment(assignment.id)}
                    >
                      <WeekBlock project={project} isCompact={selectedSize === 'compact'} />
                    </AssignmentContextMenu>
                    {isCurrentDateCell && <CurrentTimeMarker markerPosition={markerPosition} />}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
