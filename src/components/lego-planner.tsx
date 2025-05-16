'use client';

import { useState } from 'react';
import { Assignee, PlannerData } from '@/lib/types';
import { CalendarNavigation } from './calendar-navigation';
import { getSampleData } from '@/lib/sample-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WeekBlock } from './week-block';

interface LegoPlannerProps {
  initialData: PlannerData;
}

export function LegoPlanner({ initialData }: LegoPlannerProps) {
  // State for selected assignee, year, and quarter
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | undefined>(undefined);
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentQuarter, setCurrentQuarter] = useState<number>(2);

  // Get data for the current quarter and year
  const [plannerData, setPlannerData] = useState<PlannerData>(initialData);

  // Update the data when year or quarter changes
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setPlannerData(getSampleData(year, currentQuarter));
  };

  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
    setPlannerData(getSampleData(currentYear, quarter));
  };

  const handleAssigneeSelect = (assigneeId: string) => {
    // Toggle selection
    setSelectedAssigneeId((prev) => (prev === assigneeId ? undefined : assigneeId));
  };

  // Filter assignees if there's a selected assignee
  const filteredAssignees = selectedAssigneeId
    ? plannerData.assignees.filter((a) => a.id === selectedAssigneeId)
    : plannerData.assignees;

  const renderAssigneeName = (assignee: Assignee) => {
    return (
      <div
        className={cn(
          'p-2 cursor-pointer transition-colors h-full flex items-center',
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

  // Get project for a specific assignee and week
  const getAssignmentForWeek = (assigneeId: string, weekId: number) => {
    return plannerData.assignments.find((a) => a.assigneeId === assigneeId && a.weekId === weekId);
  };

  return (
    <Card className="flex flex-col h-full border-0 rounded-none bg-background">
      <CardHeader className="bg-background border-b dark:border-zinc-700 px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div>
            <CardTitle className="text-lg text-foreground">Lego Planner</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              Weekly planning board - {plannerData.weeks.length} weeks, {plannerData.assignees.length} assignees
            </p>
          </div>

          <CalendarNavigation
            currentYear={currentYear}
            currentQuarter={currentQuarter}
            onYearChange={handleYearChange}
            onQuarterChange={handleQuarterChange}
          />
        </div>
      </CardHeader>

      <CardContent className="overflow-auto p-0 flex-1">
        <Table className="border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-background dark:bg-zinc-900 shadow-sm">
            <TableRow className="border-b dark:border-zinc-700">
              <TableHead className="p-0 min-w-[500px] sticky left-0 top-0 z-30 bg-background dark:bg-zinc-900 border-r dark:border-zinc-700">
                <div className="h-10 flex items-center justify-center font-semibold text-foreground dark:text-gray-300 px-2 text-xs">
                  Assignees
                </div>
              </TableHead>

              {/* Week headers */}
              {plannerData.weeks.map((week) => (
                <TableHead
                  key={week.weekNumber}
                  className="p-0 text-center min-w-[100px] bg-background dark:bg-zinc-900 border-r dark:border-zinc-700 last:border-r-0"
                >
                  <div className="flex flex-col items-center justify-center h-10 p-1 text-foreground dark:text-gray-300">
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
            {/* Assignee rows */}
            {filteredAssignees.map((assignee) => (
              <TableRow key={assignee.id} className="dark:border-b-zinc-700">
                {/* Assignee name cell */}
                <TableCell className="p-0 font-medium sticky left-0 z-10 bg-background dark:bg-zinc-900 border-r dark:border-zinc-700">
                  {renderAssigneeName(assignee)}
                </TableCell>

                {/* Week blocks for each assignee */}
                {plannerData.weeks.map((week) => {
                  const assignment = getAssignmentForWeek(assignee.id, week.weekNumber);
                  const project = assignment
                    ? plannerData.projects.find((p) => p.id === assignment.projectId)
                    : undefined;

                  return (
                    <TableCell
                      key={`${assignee.id}-${week.weekNumber}`}
                      className="p-px h-8 bg-background dark:bg-zinc-800 border-r dark:border-zinc-700 last:border-r-0"
                    >
                      <WeekBlock week={week} project={project} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
