'use client';

import { useState } from 'react';
import { Assignment, Planner, Project, Role } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';

interface ProjectAllocationPanelProps {
  plannerData: Planner | null;
  assignments: Assignment[];
  onUpdateEstimate?: (projectId: string, role: Role, value: number) => void;
}

const ROLES_TO_DISPLAY: Role[] = ['engineering', 'design', 'qa', 'analytics', 'data_science', 'product_management'];

interface RoleAllocationDetail {
  estimated: number;
  allocated: number;
}

interface ProjectDisplayData {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  allocations: Record<Role, RoleAllocationDetail>;
}

// Helper to format role names for display
const formatRoleName = (role: Role): string => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Inline number editor component
interface InlineNumberEditorProps {
  value: number;
  onSave: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

function InlineNumberEditor({ value, onSave, disabled = false, className }: InlineNumberEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleSave = () => {
    const numericValue = Math.max(0, parseFloat(editValue) || 0);
    onSave(numericValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-12 h-6 text-xs border border-input focus:border-ring focus:ring-1 focus:ring-ring/50 px-1 py-0',
          className,
        )}
        placeholder="0"
        min="0"
        step="1"
        autoFocus
      />
    );
  }

  return (
    <span
      className={cn(
        'cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 text-xs transition-colors min-w-[12px] inline-block text-center',
        disabled && 'cursor-default hover:bg-transparent',
        className,
      )}
      onClick={handleStartEdit}
    >
      {value}
    </span>
  );
}

export function ProjectAllocationPanel({ plannerData, assignments, onUpdateEstimate }: ProjectAllocationPanelProps) {
  if (!plannerData) {
    return null;
  }

  const { projects, assignees } = plannerData;

  // Create a map of assigneeId to role for quick lookup
  const assigneeRoles = assignees.reduce(
    (acc, assignee) => {
      if (assignee.role) {
        acc[assignee.id] = assignee.role;
      }
      return acc;
    },
    {} as Record<string, Role>,
  );

  // Prepare data for the table
  const projectAllocationsData = projects.map((project: Project): ProjectDisplayData => {
    const projectRoleAllocations = ROLES_TO_DISPLAY.reduce(
      (acc, role) => {
        acc[role] = { estimated: 0, allocated: 0 };
        return acc;
      },
      {} as Record<Role, RoleAllocationDetail>,
    );

    // Populate estimated values
    project.estimates?.forEach((est) => {
      const roleKey = est.department.toLowerCase().replace(/ /g, '_') as Role;
      if (ROLES_TO_DISPLAY.includes(roleKey) && projectRoleAllocations[roleKey]) {
        projectRoleAllocations[roleKey].estimated += est.value;
      }
    });

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      icon: project.icon,
      allocations: projectRoleAllocations,
    };
  });

  // Populate allocated values
  const projectDataMap = projectAllocationsData.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<string, ProjectDisplayData>,
  );

  assignments.forEach((assignment) => {
    const assigneeRole = assigneeRoles[assignment.assigneeId];
    const projectDetail = projectDataMap[assignment.projectId];

    if (assigneeRole && projectDetail && ROLES_TO_DISPLAY.includes(assigneeRole)) {
      projectDetail.allocations[assigneeRole].allocated += 1; // Each assignment is 1 unit of work
    }
  });

  const handleEstimateUpdate = (projectId: string, role: Role, value: number) => {
    if (onUpdateEstimate) {
      onUpdateEstimate(projectId, role, value);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Project Allocation Summary (Weeks)</h1>
      <Table className="min-w-full text-xs">
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="w-[50px] whitespace-nowrap py-1 px-2">Slug</TableHead>
            <TableHead className="w-[200px] whitespace-nowrap py-1 px-2">Project</TableHead>
            {ROLES_TO_DISPLAY.map((role) => (
              <TableHead key={role} className="text-center whitespace-nowrap py-1 px-2 w-[120px]">
                {formatRoleName(role)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectAllocationsData.map((projectData) => {
            // Get project color for gradient
            const project = projects.find((p) => p.id === projectData.id);
            const projectColor = getProjectColorByName(project?.color) || getDefaultProjectColor();
            const colorHex = projectColor.hex;

            return (
              <TableRow key={projectData.id} className="h-8">
                <TableCell className="w-[50px] whitespace-nowrap py-1 px-2 overflow-hidden truncate text-muted-foreground text-xs relative">
                  {/* Gradient background */}
                  <div
                    className="absolute inset-0 opacity-20 rounded"
                    style={{
                      background: `linear-gradient(135deg, ${colorHex} 0%, transparent 70%)`,
                    }}
                  />
                  <span className="relative z-10 font-medium">{projectData.slug}</span>
                </TableCell>
                <TableCell className="font-medium w-[200px] whitespace-nowrap py-1 px-2 overflow-hidden truncate">
                  <Link href={`/projects/${projectData.id}`} className="hover:underline w-full">
                    {projectData.icon && <span className="mr-2">{projectData.icon}</span>}
                    {projectData.name}
                  </Link>
                </TableCell>
                {ROLES_TO_DISPLAY.map((role) => {
                  const data = projectData.allocations[role];
                  const mismatch = data.estimated !== data.allocated;
                  const isOverallocated = data.allocated > data.estimated;
                  const isUnderallocated = data.allocated < data.estimated && data.estimated > 0;

                  return (
                    <TableCell key={role} className="text-center whitespace-nowrap py-1 px-2 w-[120px]">
                      <div className="flex items-center justify-center gap-1 min-h-[24px]">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">Est:</span>
                          <InlineNumberEditor
                            value={data.estimated}
                            onSave={(value) => handleEstimateUpdate(projectData.id, role, value)}
                            disabled={!onUpdateEstimate}
                            className={cn(
                              mismatch && isOverallocated && 'text-red-600 dark:text-red-400',
                              mismatch && isUnderallocated && 'text-amber-600 dark:text-amber-400',
                            )}
                          />
                        </div>
                        <span className="text-muted-foreground">/</span>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">Alloc:</span>
                          <span
                            className={cn(
                              'text-xs min-w-[12px] text-center',
                              mismatch && isOverallocated && 'text-red-600 dark:text-red-400 font-medium',
                              mismatch && isUnderallocated && 'text-amber-600 dark:text-amber-400 font-medium',
                            )}
                          >
                            {data.allocated}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 ml-1">
                          {isOverallocated && <TrendingUpIcon className="h-3 w-3 text-red-500" />}
                          {isUnderallocated && <TrendingDownIcon className="h-3 w-3 text-amber-500" />}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TrendingUpIcon className="h-3 w-3 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Red: Overallocated</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDownIcon className="h-3 w-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">Amber: Underallocated</span>
          </div>
        </div>
        <p>Click on estimate values to edit them inline.</p>
      </div>
    </div>
  );
}
