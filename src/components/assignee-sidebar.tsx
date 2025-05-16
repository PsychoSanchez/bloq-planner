"use client";

import { Assignee } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Users, Calendar, Sparkles } from "lucide-react";

interface AssigneeSidebarProps {
  assignees: Assignee[];
  selectedAssigneeId?: string;
  onAssigneeSelect?: (assigneeId: string) => void;
}

export function AssigneeSidebar({ 
  assignees, 
  selectedAssigneeId, 
  onAssigneeSelect 
}: AssigneeSidebarProps) {
  // Group assignees by type
  const personAssignees = assignees.filter(a => a.type === 'person');
  const otherAssignees = assignees.filter(a => a.type !== 'person');

  // Get icon for assignee type
  const getAssigneeIcon = (type: string) => {
    switch (type) {
      case 'person':
        return <User className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'team':
        return <Users className="h-4 w-4 mr-2 text-blue-500" />;
      case 'dependency':
        return <Sparkles className="h-4 w-4 mr-2 text-purple-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 mr-2 text-green-500" />;
      default:
        return null;
    }
  };

  // Format the assignee name with type indicator
  const formatAssigneeName = (assignee: Assignee) => {
    return (
      <div className="flex items-center">
        {getAssigneeIcon(assignee.type)}
        <span 
          className={cn(
            "font-medium",
            assignee.type === 'team' && "text-blue-600",
            assignee.type === 'dependency' && "italic text-purple-600",
            assignee.type === 'event' && "text-green-600"
          )}
        >
          {assignee.name}
        </span>
      </div>
    );
  };

  const renderAssignee = (assignee: Assignee) => (
    <Card 
      key={assignee.id}
      className={cn(
        "py-3 px-4 border-b hover:bg-accent/50 cursor-pointer transition-colors",
        selectedAssigneeId === assignee.id ? "bg-accent" : "bg-background"
      )}
      onClick={() => onAssigneeSelect?.(assignee.id)}
    >
      {formatAssigneeName(assignee)}
    </Card>
  );

  return (
    <div className="sticky left-0 top-16 bg-card border-r z-10 min-w-52">
      {/* Header */}
      <div className="bg-muted py-3 px-4 font-semibold border-b text-center h-16 flex items-center justify-center">
        <h2 className="text-lg">Assignees</h2>
      </div>

      {/* People */}
      <div className="divide-y">
        {personAssignees.map(renderAssignee)}
      </div>

      {/* Separator */}
      {otherAssignees.length > 0 && (
        <Separator className="my-2" />
      )}

      {/* Other Assignees */}
      {otherAssignees.length > 0 && (
        <div className="divide-y">
          {otherAssignees.map(renderAssignee)}
        </div>
      )}
    </div>
  );
} 