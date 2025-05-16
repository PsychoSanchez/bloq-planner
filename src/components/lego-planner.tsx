"use client";

import { useState } from "react";
import { Assignee, PlannerData } from "@/lib/types";
import { CalendarNavigation } from "./calendar-navigation";
import { getSampleData } from "@/lib/sample-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { WeekBlock } from "./week-block";

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
    const newData = getSampleData(year, currentQuarter);
    setPlannerData(newData);
  };
  
  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
    const newData = getSampleData(currentYear, quarter);
    setPlannerData(newData);
  };

  const handleAssigneeSelect = (assigneeId: string) => {
    // Toggle selection
    setSelectedAssigneeId(prev => 
      prev === assigneeId ? undefined : assigneeId
    );
  };

  // Filter assignees if there's a selected assignee
  const filteredAssignees = selectedAssigneeId
    ? plannerData.assignees.filter(a => a.id === selectedAssigneeId)
    : plannerData.assignees;

  const renderAssigneeName = (assignee: Assignee) => {
    return (
      <div 
        className={cn(
          "p-3 cursor-pointer hover:bg-accent/50 transition-colors",
          selectedAssigneeId === assignee.id ? "bg-accent" : "bg-card"
        )}
        onClick={() => handleAssigneeSelect(assignee.id)}
      >
        <div className="flex items-center">
          <span className="font-medium truncate">{assignee.name}</span>
        </div>
      </div>
    );
  };

  // Get project for a specific assignee and week
  const getAssignmentForWeek = (assigneeId: string, weekId: number) => {
    return plannerData.assignments.find(
      a => a.assigneeId === assigneeId && a.weekId === weekId
    );
  };

  return (
    <Card className="flex flex-col h-full border-0 rounded-none">
      <CardHeader className="bg-background border-b px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Lego Planner</CardTitle>
            <p className="text-muted-foreground mt-1">
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
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              {/* Empty cell for the assignee column header */}
              <TableHead className="p-0 min-w-52 bg-muted">
                <div className="h-16 flex items-center justify-center font-semibold">
                  Assignees
                </div>
              </TableHead>
              
              {/* Week headers */}
              {plannerData.weeks.map(week => (
                <TableHead key={week.weekNumber} className="p-0 text-center min-w-24">
                  <div className="flex flex-col items-center justify-center h-16 p-1">
                    <div className="text-sm font-medium">
                      {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">Week {week.weekNumber}</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Assignee rows */}
            {filteredAssignees.map(assignee => (
              <TableRow key={assignee.id}>
                {/* Assignee name cell */}
                <TableCell className="p-0 font-medium bg-card border-r sticky left-0 z-10">
                  {renderAssigneeName(assignee)}
                </TableCell>
                
                {/* Week blocks for each assignee */}
                {plannerData.weeks.map(week => {
                  const assignment = getAssignmentForWeek(assignee.id, week.weekNumber);
                  const project = assignment ? plannerData.projects.find(p => p.id === assignment.projectId) : undefined;
                  
                  return (
                    <TableCell key={`${assignee.id}-${week.weekNumber}`} className="p-0 h-12">
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