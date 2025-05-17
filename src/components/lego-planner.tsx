'use client';

import { useState, useRef, useEffect } from 'react';
import { Assignee, PlannerData } from '@/lib/types';
import { CalendarNavigation } from './calendar-navigation';
import { getSampleData } from '@/lib/sample-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from './week-block';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AssigneeFilter } from './assignee-filter';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Predefined column width sizes
const COLUMN_SIZES = {
  compact: 80,
  normal: 100,
  wide: 150,
};

type ColumnSizeType = keyof typeof COLUMN_SIZES;

interface LegoPlannerProps {
  initialData: PlannerData;
}

export function LegoPlanner({ initialData }: LegoPlannerProps) {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentQuarter, setCurrentQuarter] = useState<number>(2);
  const [plannerData, setPlannerData] = useState<PlannerData>(initialData);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | undefined>(undefined);
  const [isInspectModeEnabled, setIsInspectModeEnabled] = useState<boolean>(false);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<ColumnSizeType>('normal');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Load selected size from localStorage on initial render
  useEffect(() => {
    const savedSize = localStorage.getItem('lego-planner-column-size');
    if (savedSize) {
      try {
        const size = JSON.parse(savedSize) as ColumnSizeType;
        if (size === 'compact' || size === 'normal' || size === 'wide') {
          setSelectedSize(size);
        }
      } catch (e) {
        console.error('Failed to parse saved column size', e);
      }
    }
  }, []);

  // Save selected size to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('lego-planner-column-size', JSON.stringify(selectedSize));
  }, [selectedSize]);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setPlannerData(getSampleData(year, currentQuarter));
  };

  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
    setPlannerData(getSampleData(currentYear, quarter));
  };

  const handleMouseEnterCell = (projectId?: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (projectId && isInspectModeEnabled) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredProjectId(projectId);
      }, 500); // 0.5 second delay
    }
  };

  const handleMouseLeaveCell = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredProjectId(undefined);
  };

  const handleInspectToggle = (checked: boolean) => {
    setIsInspectModeEnabled(checked);
    if (!checked) {
      setHoveredProjectId(undefined); // Clear hover when disabling inspect mode
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    }
  };

  const handleAssigneesChange = (assigneeIds: string[]) => {
    setSelectedAssigneeIds(assigneeIds);
  };

  const renderAssigneeName = (assignee: Assignee) => {
    return (
      <div className="px-1 py-0.5 h-full flex items-center text-foreground dark:text-gray-200">
        <span className="font-medium truncate text-xs">{assignee.name}</span>
      </div>
    );
  };

  const getAssignmentForWeek = (assigneeId: string, weekId: number) => {
    return plannerData.assignments.find((a) => a.assigneeId === assigneeId && a.weekId === weekId);
  };

  // Set column size
  const setColumnSize = (size: ColumnSizeType) => {
    setSelectedSize(size);
  };

  // Reset column widths to default
  const resetColumnSize = () => {
    setSelectedSize('normal');
    localStorage.removeItem('lego-planner-column-size');
  };

  // Filter assignees based on selection
  const filteredAssignees =
    selectedAssigneeIds.length > 0
      ? plannerData.assignees.filter((a) => selectedAssigneeIds.includes(a.id))
      : plannerData.assignees;

  // Get current column width value
  const columnWidth = COLUMN_SIZES[selectedSize];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div>
          <h1 className="text-lg text-foreground">Lego Planner</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Weekly planning board - {plannerData.weeks.length} weeks, {plannerData.assignees.length} assignees
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
            <div className="flex items-center gap-1">
              <ToggleGroup
                type="single"
                value={selectedSize}
                onValueChange={(value) => {
                  if (value) {
                    setColumnSize(value as ColumnSizeType);
                  }
                }}
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
            {plannerData.weeks.map((week) => (
              <TableHead
                key={week.weekNumber}
                className="p-0 text-center border-r dark:border-zinc-700 last:border-r-0 relative"
                style={{
                  minWidth: `${columnWidth}px`,
                  width: `${columnWidth}px`,
                  transition: 'width 0.2s ease-in-out',
                }}
              >
                <div className="flex flex-col items-center justify-center h-7 p-0.5 text-foreground dark:text-gray-300">
                  <div className="text-xs font-medium">
                    {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground dark:text-gray-400">Week {week.weekNumber}</div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssignees.map((assignee) => (
            <TableRow key={assignee.id}>
              <TableCell className="p-0 font-medium border-r dark:border-zinc-700 sticky left-0 top-0 z-30 bg-background">
                {renderAssigneeName(assignee)}
              </TableCell>
              {plannerData.weeks.map((week, index) => {
                const assignment = getAssignmentForWeek(assignee.id, week.weekNumber);
                const project = assignment
                  ? plannerData.projects.find((p) => p.id === assignment.projectId)
                  : undefined;

                return (
                  <TableCell
                    key={index}
                    className={cn(
                      'p-0 h-8 border-r dark:border-zinc-700 last:border-r-0 transition-opacity duration-300',
                      hoveredProjectId && project && project.id !== hoveredProjectId && 'opacity-30',
                      hoveredProjectId &&
                        project &&
                        project.id === hoveredProjectId &&
                        'ring-2 ring-green-500 dark:ring-green-400',
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
