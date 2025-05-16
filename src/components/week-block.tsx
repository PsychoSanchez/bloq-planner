"use client";

import { Project, WeekData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WeekBlockProps {
  week: WeekData;
  project?: Project;
  isHeader?: boolean;
}

export function WeekBlock({ week, project, isHeader = false }: WeekBlockProps) {
  // Map project types to tailwind classes that match shadcn theme colors
  const getProjectClasses = (type?: string) => {
    if (!type) return "bg-muted text-muted-foreground";
    
    switch (type) {
      case 'tech-debt':
        return "bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300";
      case 'team-event':
        return "bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300";
      case 'spillover':
        return "bg-orange-100 dark:bg-orange-950/50 text-orange-900 dark:text-orange-300";
      case 'blocked':
        return "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
      case 'hack':
        return "bg-indigo-500 dark:bg-indigo-600 text-white";
      default:
        return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300";
    }
  };

  // Format date for header display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isHeader) {
    return (
      <div className="flex flex-col items-center justify-center h-16 border-b border-r p-1 min-w-20 bg-muted/50">
        <div className="text-sm font-medium">{formatDate(week.startDate)}</div>
        <div className="text-xs mt-1 text-muted-foreground">Week {week.weekNumber}</div>
      </div>
    );
  }

  // If we have a project, wrap it in a tooltip
  if (project) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className={cn(
                "flex items-center justify-center h-full w-full border-0 p-1 min-w-20 rounded-none",
                getProjectClasses(project.type)
              )}
            >
              <span className="text-sm font-medium truncate">{project.name}</span>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p><strong>{project.name}</strong></p>
            <p className="text-xs text-muted-foreground">Type: {project.type}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Empty block
  return (
    <Card 
      className="flex items-center justify-center h-full w-full border-0 p-1 min-w-20 rounded-none bg-card"
    >
      <span className="text-xs text-muted-foreground">--</span>
    </Card>
  );
} 