'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Assignee, Planner, Assignment } from '@/lib/types';
import { CalendarNavigation } from './calendar-navigation';
import { generateWeeks } from '@/lib/sample-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from './week-block';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AssigneeFilter } from './assignee-filter';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { parseAsInteger, useQueryState } from 'nuqs';
import { getAllAvailableProjects, isDefaultProject, DEFAULT_PROJECTS } from '@/lib/constants/default-projects';
import {
  Wrench,
  Calendar,
  ArrowRightCircle,
  XCircle,
  Sparkles,
  FileCode2,
  Thermometer,
  PalmtreeIcon,
  GraduationCap,
  Shield,
  AlertTriangle,
  Check,
  Trash2,
} from 'lucide-react';

// Predefined column width sizes
const COLUMN_SIZES = {
  compact: 80,
  normal: 100,
  wide: 150,
};

type ColumnSizeType = keyof typeof COLUMN_SIZES;

interface LegoPlannerProps {
  initialData: Planner;
  getAssignmentsForWeekAndAssignee: (weekNumber: number, assigneeId: string) => Assignment | undefined;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (assignmentId: string) => void;
}

const useLegoPlannerViewSize = () => {
  const [selectedSize, setSelectedSize] = useState<ColumnSizeType>('normal');
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

  // Set column size
  const setColumnSize = (size: ColumnSizeType) => {
    setSelectedSize(size);
  };

  // Reset column widths to default
  const resetColumnSize = () => {
    setSelectedSize('normal');
    localStorage.removeItem('lego-planner-column-size');
  };
  // Get current column width value
  const columnWidth = COLUMN_SIZES[selectedSize];

  return { selectedSize, setColumnSize, resetColumnSize, columnWidth };
};

// Helper function to get project icon
const getProjectIcon = (projectType: string) => {
  switch (projectType) {
    case 'tech-debt':
      return <Wrench className="h-3.5 w-3.5" />;
    case 'team-event':
      return <Calendar className="h-3.5 w-3.5" />;
    case 'spillover':
      return <ArrowRightCircle className="h-3.5 w-3.5" />;
    case 'blocked':
      return <XCircle className="h-3.5 w-3.5" />;
    case 'hack':
      return <Sparkles className="h-3.5 w-3.5" />;
    case 'sick-leave':
      return <Thermometer className="h-3.5 w-3.5" />;
    case 'vacation':
      return <PalmtreeIcon className="h-3.5 w-3.5" />;
    case 'onboarding':
      return <GraduationCap className="h-3.5 w-3.5" />;
    case 'duty':
      return <Shield className="h-3.5 w-3.5" />;
    case 'risky-week':
      return <AlertTriangle className="h-3.5 w-3.5" />;
    default:
      return <FileCode2 className="h-3.5 w-3.5" />;
  }
};

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

  const { selectedSize, setColumnSize, columnWidth, resetColumnSize } = useLegoPlannerViewSize();

  const weeks = useMemo(() => generateWeeks(currentYear, currentQuarter), [currentYear, currentQuarter]);

  // Get all available projects (regular + default)
  const allAvailableProjects = useMemo(() => {
    return getAllAvailableProjects(plannerData.projects);
  }, [plannerData.projects]);

  // Separate regular and default projects for context menu
  const regularProjects = useMemo(() => {
    return plannerData.projects.filter((p) => !isDefaultProject(p.id));
  }, [plannerData.projects]);

  const defaultProjects = useMemo(() => {
    return DEFAULT_PROJECTS;
  }, []);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
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

  // Filter assignees based on selection
  const filteredAssignees =
    selectedAssigneeIds.length > 0
      ? plannerData.assignees.filter((a) => selectedAssigneeIds.includes(a.id))
      : plannerData.assignees;

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
            {weeks.map((week) => (
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
              {weeks.map((week, index) => {
                const assignment = getAssignmentsForWeekAndAssignee(week.weekNumber, assignee.id);
                const project = assignment
                  ? allAvailableProjects.find((p) => p.id === assignment.projectId)
                  : undefined;

                return (
                  <TableCell
                    key={index}
                    className={cn(
                      'p-0 h-8 border-r dark:border-zinc-700 last:border-r-0 transition-opacity duration-300',
                      hoveredProjectId && project && project.id !== hoveredProjectId && 'opacity-30',
                    )}
                    style={{
                      minWidth: `${columnWidth}px`,
                      width: `${columnWidth}px`,
                      transition: 'width 0.2s ease-in-out',
                    }}
                    onMouseEnter={() => handleMouseEnterCell(project?.id)}
                    onMouseLeave={handleMouseLeaveCell}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <WeekBlock project={project} isCompact={selectedSize === 'compact'} />
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56">
                        {/* Regular Projects */}
                        {regularProjects.length > 0 && (
                          <>
                            {regularProjects.map((p) => (
                              <ContextMenuItem
                                key={p.id}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                                onClick={() => {
                                  if (assignment) {
                                    updateAssignment({
                                      id: assignment.id,
                                      assigneeId: assignee.id,
                                      plannerId: plannerData.id,
                                      week: week.weekNumber,
                                      year: currentYear,
                                      quarter: currentQuarter,
                                      projectId: p.id,
                                    });
                                  } else {
                                    createAssignment({
                                      assigneeId: assignee.id,
                                      projectId: p.id,
                                      plannerId: plannerData.id,
                                      week: week.weekNumber,
                                      year: currentYear,
                                      quarter: currentQuarter,
                                    });
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getProjectIcon(p.type)}
                                  <span className="truncate">{p.name}</span>
                                </div>
                                {assignment?.projectId === p.id && <Check className="h-3.5 w-3.5 text-green-600" />}
                              </ContextMenuItem>
                            ))}
                          </>
                        )}

                        {/* Default Projects */}
                        {defaultProjects.length > 0 && (
                          <>
                            {regularProjects.length > 0 && <ContextMenuSeparator />}
                            {defaultProjects.map((p) => (
                              <ContextMenuItem
                                key={p.id}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                                onClick={() => {
                                  if (assignment) {
                                    updateAssignment({
                                      id: assignment.id,
                                      assigneeId: assignee.id,
                                      plannerId: plannerData.id,
                                      week: week.weekNumber,
                                      year: currentYear,
                                      quarter: currentQuarter,
                                      projectId: p.id,
                                    });
                                  } else {
                                    createAssignment({
                                      assigneeId: assignee.id,
                                      projectId: p.id,
                                      plannerId: plannerData.id,
                                      week: week.weekNumber,
                                      year: currentYear,
                                      quarter: currentQuarter,
                                    });
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getProjectIcon(p.type)}
                                  <span className="truncate text-muted-foreground">{p.name}</span>
                                </div>
                                {assignment?.projectId === p.id && <Check className="h-3.5 w-3.5 text-green-600" />}
                              </ContextMenuItem>
                            ))}
                          </>
                        )}

                        {/* Remove Assignment Option */}
                        {assignment && (
                          <>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => {
                                deleteAssignment(assignment.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove Assignment</span>
                            </ContextMenuItem>
                          </>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
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
