'use client';

import { Assignment, Planner, Project, Role } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'; // For warning icon
import Link from 'next/link';

interface ProjectAllocationPanelProps {
  plannerData: Planner | null;
  assignments: Assignment[];
}

const ROLES_TO_DISPLAY: Role[] = ['engineering', 'design', 'qa', 'analytics', 'data_science', 'product_management'];

interface RoleAllocationDetail {
  estimated: number;
  allocated: number;
}

interface ProjectDisplayData {
  id: string;
  name: string;
  icon?: string;
  allocations: Record<Role, RoleAllocationDetail>;
}

// Helper to format role names for display
const formatRoleName = (role: Role): string => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export function ProjectAllocationPanel({ plannerData, assignments }: ProjectAllocationPanelProps) {
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

  return (
    <div>
      <h1>Project Allocation Summary (Weeks)</h1>
      <Table className="min-w-full text-xs">
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="min-w-[200px] whitespace-nowrap py-1 px-2">Project</TableHead>
            {ROLES_TO_DISPLAY.map((role) => (
              <TableHead key={role} className="text-center whitespace-nowrap py-1 px-2">
                {formatRoleName(role)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectAllocationsData.map((projectData) => (
            <TableRow key={projectData.id} className="h-8">
              <TableCell className="font-medium  min-w-[200px] whitespace-nowrap py-1 px-2">
                <Link href={`/projects/${projectData.id}`} className="hover:underline w-full">
                  {projectData.icon && <span className="mr-2">{projectData.icon}</span>}
                  {projectData.name}
                </Link>
              </TableCell>
              {ROLES_TO_DISPLAY.map((role) => {
                const data = projectData.allocations[role];
                const mismatch = data.estimated !== data.allocated;
                const isOverallocated = data.allocated > data.estimated;
                const isUnderallocated = data.allocated < data.estimated;
                return (
                  <TableCell key={role} className="text-center whitespace-nowrap py-1 px-2">
                    <div className={`flex items-center justify-center gap-1 ${mismatch ? 'text-orange-500' : ''}`}>
                      <span>{`Est: ${data.estimated} / Alloc: ${data.allocated}`}</span>
                      {mismatch && <AlertTriangleIcon className="h-4 w-4" />}
                      {isOverallocated && <TrendingUpIcon className="h-4 w-4" />}
                      {isUnderallocated && <TrendingDownIcon className="h-4 w-4" />}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
