import React from 'react';
import { Assignee } from '@/lib/types';
import { getRoleIcon } from '@/lib/utils/icons';

interface AssigneeNameProps {
  assignee: Assignee;
}

export function AssigneeName({ assignee }: AssigneeNameProps) {
  const roleIcon = getRoleIcon(assignee.role);

  return (
    <div className="px-1 py-0.5 h-full flex items-center text-foreground dark:text-gray-200">
      {roleIcon && <div className="mr-2 flex-shrink-0">{roleIcon}</div>}
      <span className="font-medium truncate text-xs">{assignee.name}</span>
    </div>
  );
}
