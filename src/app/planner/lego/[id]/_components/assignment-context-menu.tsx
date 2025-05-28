import React from 'react';
import { Assignment, Project } from '@/lib/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { getProjectIcon } from '@/lib/utils/icons';
import { Check, Trash2 } from 'lucide-react';

interface AssignmentContextMenuProps {
  children: React.ReactNode;
  assignment?: Assignment;
  regularProjects: Project[];
  defaultProjects: Project[];
  onAssignProject: (projectId: string) => void;
  onDeleteAssignment: () => void;
}

export function AssignmentContextMenu({
  children,
  assignment,
  regularProjects,
  defaultProjects,
  onAssignProject,
  onDeleteAssignment,
}: AssignmentContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Regular Projects */}
        {regularProjects.length > 0 && (
          <>
            {regularProjects.map((p) => (
              <ContextMenuItem
                key={p.id}
                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                onClick={() => onAssignProject(p.id)}
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
                onClick={() => onAssignProject(p.id)}
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
              onClick={onDeleteAssignment}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove Assignment</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
