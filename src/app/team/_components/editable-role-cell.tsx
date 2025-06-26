'use client';

import { useState } from 'react';
import { RoleSelector } from '@/app/team/_components/role-selector';
import { RouterInput } from '@/utils/trpc';
import { Role } from '@/lib/types';

type UpdateTeamMemberRoleInput = RouterInput['team']['updateTeamMemberRole'];

interface EditableRoleCellProps {
  memberId: string;
  initialRole?: string;
  onRoleUpdate?: (props: UpdateTeamMemberRoleInput) => Promise<void>;
  isEditable?: boolean;
}

export function EditableRoleCell({
  memberId,
  initialRole = '',
  onRoleUpdate,
  isEditable = false,
}: EditableRoleCellProps) {
  const [role, setRole] = useState(initialRole);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: Role) => {
    if (!onRoleUpdate) {
      setRole(newRole);
      return;
    }

    setIsUpdating(true);
    try {
      await onRoleUpdate({ id: memberId, role: newRole });
      setRole(newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
      // Could add toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <RoleSelector
        value={role}
        onSelect={handleRoleChange}
        type="inline"
        placeholder="Select role"
        readonly={!isEditable}
      />
      {isUpdating && <span className="ml-2 text-xs text-muted-foreground">Updating...</span>}
    </div>
  );
}
