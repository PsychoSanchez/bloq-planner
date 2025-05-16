"use client";

import { useCallback, useMemo } from "react";
import { Assignment, PlannerData } from "@/lib/types";
import { WeekBlock } from "./week-block";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlannerGridProps {
  data: PlannerData;
  selectedAssigneeId?: string;
}

export function PlannerGrid({ data, selectedAssigneeId }: PlannerGridProps) {
  const { weeks, assignments, projects } = data;

  // Filter assignments if there's a selected assignee
  const filteredAssignments = useMemo(() => {
    if (!selectedAssigneeId) return assignments;
    return assignments.filter(a => a.assigneeId === selectedAssigneeId);
  }, [assignments, selectedAssigneeId]);

  // Get project for a specific assignee and week
  const getAssignmentForWeek = useCallback((assigneeId: string, weekId: number) => {
    return filteredAssignments.find(
      a => a.assigneeId === assigneeId && a.weekId === weekId
    );
  }, [filteredAssignments]);

  // Get project details from assignment
  const getProjectFromAssignment = useCallback((assignment?: Assignment) => {
    if (!assignment) return undefined;
    return projects.find(p => p.id === assignment.projectId);
  }, [projects]);

  // Filter assignees if there's a selected assignee
  const filteredAssignees = useMemo(() => {
    if (!selectedAssigneeId) return data.assignees;
    return data.assignees.filter(a => a.id === selectedAssigneeId);
  }, [data.assignees, selectedAssigneeId]);

  return (
    <Card className="overflow-x-auto flex-1 border-0 rounded-none">
      <div className="min-w-max">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              {weeks.map(week => (
                <TableHead key={week.weekNumber} className="p-0 text-center min-w-20">
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
            {filteredAssignees.map(assignee => (
              <TableRow key={assignee.id}>
                {weeks.map(week => {
                  const assignment = getAssignmentForWeek(assignee.id, week.weekNumber);
                  const project = getProjectFromAssignment(assignment);
                  
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
      </div>
    </Card>
  );
} 