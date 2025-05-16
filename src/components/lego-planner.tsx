'use client';

import { useState, useRef } from 'react';
import { Assignee, PlannerData } from '@/lib/types';
import { CalendarNavigation } from './calendar-navigation';
import { getSampleData } from '@/lib/sample-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from './week-block';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LegoPlannerProps {
  initialData: PlannerData;
}

export function LegoPlanner({ initialData }: LegoPlannerProps) {
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | undefined>(undefined);
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentQuarter, setCurrentQuarter] = useState<number>(2);
  const [plannerData, setPlannerData] = useState<PlannerData>(initialData);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | undefined>(undefined);
  const [isInspectModeEnabled, setIsInspectModeEnabled] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setPlannerData(getSampleData(year, currentQuarter));
  };

  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
    setPlannerData(getSampleData(currentYear, quarter));
  };

  const handleAssigneeSelect = (assigneeId: string) => {
    setSelectedAssigneeId((prev) => (prev === assigneeId ? undefined : assigneeId));
  };

  const filteredAssignees = selectedAssigneeId
    ? plannerData.assignees.filter((a) => a.id === selectedAssigneeId)
    : plannerData.assignees;

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

  const renderAssigneeName = (assignee: Assignee) => {
    return (
      <div
        className={cn(
          'px-1 py-0.5 cursor-pointer transition-colors h-full flex items-center',
          'hover:bg-muted/80 dark:hover:bg-zinc-700',
          selectedAssigneeId === assignee.id
            ? 'bg-accent dark:bg-blue-700 text-accent-foreground dark:text-white'
            : 'bg-transparent text-foreground dark:text-gray-200',
        )}
        onClick={() => handleAssigneeSelect(assignee.id)}
      >
        <span className="font-medium truncate text-xs">{assignee.name}</span>
      </div>
    );
  };

  const getAssignmentForWeek = (assigneeId: string, weekId: number) => {
    return plannerData.assignments.find((a) => a.assigneeId === assigneeId && a.weekId === weekId);
  };

  const handleDragEnd = (result: DropResult) => {
    console.log(result);
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    // Example: if dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Logic to update assignments
    // This is a placeholder and needs to be implemented based on your data structure and requirements
    // For example, you might want to:
    // 1. Identify the source project/task being dragged
    // 2. Identify the target assignee and week
    // 3. Update the `plannerData.assignments` array
    //    - Remove the assignment from the source
    //    - Add/update the assignment at the destination

    // For now, let's just log what happened.
    console.log(`Dragged item ${draggableId} from ${source.droppableId} at index ${source.index} to ${destination.droppableId} at index ${destination.index}`);

    // You'll need to update `plannerData` state here
    // setPlannerData(updatedData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Card className="flex flex-col h-full border-0 rounded-none bg-background">
        <CardHeader className="bg-background border-b dark:border-zinc-700 px-2 py-1">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <CardTitle className="text-lg text-foreground">Lego Planner</CardTitle>
              <p className="text-muted-foreground mt-1 text-xs">
                Weekly planning board - {plannerData.weeks.length} weeks, {plannerData.assignees.length} assignees
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="inspect-mode" checked={isInspectModeEnabled} onCheckedChange={handleInspectToggle} />
                <Label htmlFor="inspect-mode" className="text-xs text-muted-foreground">
                  Inspect
                </Label>
              </div>
              <CalendarNavigation
                currentYear={currentYear}
                currentQuarter={currentQuarter}
                onYearChange={handleYearChange}
                onQuarterChange={handleQuarterChange}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-auto p-0 flex-1">
          <Table className="border-collapse">
            <TableHeader className="sticky top-0 z-20 bg-background dark:bg-zinc-900 shadow-sm">
              <TableRow className="border-b dark:border-zinc-700">
                <TableHead className="p-0 min-w-[150px] sticky left-0 top-0 z-30 bg-background dark:bg-zinc-900 border-r dark:border-zinc-700">
                  <div className="h-7 flex items-center justify-center font-semibold text-foreground dark:text-gray-300 px-1 text-xs">
                    Assignees
                  </div>
                </TableHead>
                {plannerData.weeks.map((week) => (
                  <TableHead
                    key={week.weekNumber}
                    className="p-0 text-center min-w-[100px] bg-background dark:bg-zinc-900 border-r dark:border-zinc-700 last:border-r-0"
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
            <TableBody className="divide-y dark:divide-zinc-700">
              {filteredAssignees.map((assignee) => (
                <Droppable droppableId={assignee.id} key={assignee.id} direction="horizontal">
                  {(provided) => (
                    <TableRow
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="dark:border-b-zinc-700"
                    >
                      <TableCell className="p-0 font-medium sticky left-0 z-10 bg-background dark:bg-zinc-900 border-r dark:border-zinc-700 min-w-[150px]">
                        {renderAssigneeName(assignee)}
                      </TableCell>
                      {plannerData.weeks.map((week, index) => {
                        const assignment = getAssignmentForWeek(assignee.id, week.weekNumber);
                        const project = assignment
                          ? plannerData.projects.find((p) => p.id === assignment.projectId)
                          : undefined;
                        // Unique draggableId combining assignee, week, and project (if any)
                        const draggableId = `week-${assignee.id}-${week.weekNumber}-${project?.id || 'empty'}`;

                        return (
                          <Draggable draggableId={draggableId} index={index} key={draggableId}>
                            {(providedDraggable, snapshot) => (
                              <TableCell
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                {...providedDraggable.dragHandleProps}
                                className={cn(
                                  "p-px h-8 bg-background dark:bg-zinc-800 border-r dark:border-zinc-700 last:border-r-0 transition-opacity duration-300",
                                  snapshot.isDragging && "ring-2 ring-blue-500 opacity-80 dark:ring-blue-400",
                                  hoveredProjectId && project && project.id !== hoveredProjectId && "opacity-30",
                                  hoveredProjectId && project && project.id === hoveredProjectId && "ring-2 ring-green-500 dark:ring-green-400"
                                )}
                                style={{
                                  ...providedDraggable.draggableProps.style,
                                  // minWidth: '100px', // Ensure cells have a minimum width
                                }}
                                onMouseEnter={() => handleMouseEnterCell(project?.id)}
                                onMouseLeave={handleMouseLeaveCell}
                              >
                                <WeekBlock week={week} project={project} />
                              </TableCell>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </TableRow>
                  )}
                </Droppable>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DragDropContext>
  );
}
