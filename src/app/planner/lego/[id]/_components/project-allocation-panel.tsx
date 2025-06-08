'use client';

import { useState, useMemo, useCallback } from 'react';
import { Assignment, Planner, Project, Role } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { TrendingUpIcon, TrendingDownIcon, PaintBucket } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';
import { generateWeeks } from '@/lib/sample-data';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isDefaultProject, DEFAULT_PROJECTS } from '@/lib/constants/default-projects';
import { parseAsBoolean, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { getProjectStyles } from '@/lib/utils/project-styling';
import { ROLE_OPTIONS } from '@/lib/constants';

interface ProjectAllocationPanelProps {
  plannerData: Planner | null;
  assignments: Assignment[];
  currentYear: number;
  currentQuarter: number;
  onUpdateEstimate?: (projectId: string, role: Role, value: number) => void;
}

const ROLES_TO_DISPLAY: Role[] = ROLE_OPTIONS.map((role) => role.id);

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

interface RoleCapacityData {
  capacity: number;
  totalEstimated: number;
  totalAllocated: number;
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

export function ProjectAllocationPanel({
  plannerData,
  assignments,
  currentYear,
  currentQuarter,
  onUpdateEstimate,
}: ProjectAllocationPanelProps) {
  // Calculate weeks in the current quarter
  const weeks = useMemo(() => generateWeeks(currentYear, currentQuarter), [currentYear, currentQuarter]);
  const weeksInQuarter = weeks.length;

  // State for filtering projects by current quarter
  const [filterByCurrentQuarter, setFilterByCurrentQuarter] = useQueryState(
    'filterByCurrentQuarter',
    parseAsBoolean.withDefault(true),
  );

  // Mode state for painting
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringEnum(['pointer', 'paint', 'erase', 'inspect']).withDefault('pointer'),
  );

  // Selected project for painting
  const [selectedProjectId, setSelectedProjectId] = useQueryState('paintProject', parseAsString.withDefault(''));

  // Create a map of assigneeId to role for quick lookup
  const assigneeRoles = useMemo(() => {
    if (!plannerData) return {};

    return plannerData.assignees.reduce(
      (acc, assignee) => {
        if (assignee.role) {
          return { ...acc, [assignee.id]: assignee.role };
        }
        return acc;
      },
      {} as Record<string, Role>,
    );
  }, [plannerData]);

  // Calculate capacity per role based on assignees and weeks in quarter
  const roleCapacityData = useMemo(() => {
    const initialCapacityData: Record<Role, RoleCapacityData> = ROLES_TO_DISPLAY.reduce(
      (acc, role) => ({
        ...acc,
        [role]: { capacity: 0, totalEstimated: 0, totalAllocated: 0 },
      }),
      {} as Record<Role, RoleCapacityData>,
    );

    if (!plannerData) {
      return initialCapacityData;
    }

    // Calculate capacity based on number of assignees per role
    const capacityData = plannerData.assignees.reduce((acc, assignee) => {
      if (assignee.role && ROLES_TO_DISPLAY.includes(assignee.role)) {
        return {
          ...acc,
          [assignee.role]: {
            ...acc[assignee.role],
            capacity: acc[assignee.role].capacity + weeksInQuarter,
          },
        };
      }
      return acc;
    }, initialCapacityData);

    return capacityData;
  }, [plannerData, weeksInQuarter]);

  // Prepare project allocations data
  const projectAllocationsData = useMemo(() => {
    if (!plannerData) return [];

    return plannerData.projects.map((project: Project): ProjectDisplayData => {
      const projectRoleAllocations = ROLES_TO_DISPLAY.reduce(
        (acc, role) => ({
          ...acc,
          [role]: { estimated: 0, allocated: 0 },
        }),
        {} as Record<Role, RoleAllocationDetail>,
      );

      // Populate estimated values
      const allocationsWithEstimates =
        project.estimates?.reduce((acc, est) => {
          const roleKey = est.department.toLowerCase().replace(/ /g, '_') as Role;
          if (ROLES_TO_DISPLAY.includes(roleKey)) {
            return {
              ...acc,
              [roleKey]: {
                ...acc[roleKey],
                estimated: acc[roleKey].estimated + est.value,
              },
            };
          }
          return acc;
        }, projectRoleAllocations) || projectRoleAllocations;

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        icon: project.icon,
        allocations: allocationsWithEstimates,
      };
    });
  }, [plannerData]);

  // Add default projects to the allocation data
  const defaultProjectsData = useMemo(() => {
    return DEFAULT_PROJECTS.map((project: Project): ProjectDisplayData => {
      const projectRoleAllocations = ROLES_TO_DISPLAY.reduce(
        (acc, role) => ({
          ...acc,
          [role]: { estimated: 0, allocated: 0 },
        }),
        {} as Record<Role, RoleAllocationDetail>,
      );

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        icon: project.icon,
        allocations: projectRoleAllocations,
      };
    });
  }, []);

  // Separate regular and default projects
  const regularProjectsData = useMemo(() => {
    return projectAllocationsData.filter((project) => !isDefaultProject(project.id));
  }, [projectAllocationsData]);

  // Create project data map for quick lookup (including both regular and default projects)
  const projectDataMap = useMemo(() => {
    const allProjects = [...regularProjectsData, ...defaultProjectsData];
    return allProjects.reduce(
      (acc, p) => ({
        ...acc,
        [p.id]: p,
      }),
      {} as Record<string, ProjectDisplayData>,
    );
  }, [regularProjectsData, defaultProjectsData]);

  // Create current quarter string in the format used by projects (e.g., "2025Q2")
  const currentQuarterString = useMemo(() => {
    return `${currentYear}Q${currentQuarter}`;
  }, [currentYear, currentQuarter]);

  // Filter regular projects based on the toggle state (default projects are always shown)
  const filteredRegularProjects = useMemo(() => {
    if (!filterByCurrentQuarter) {
      return regularProjectsData;
    }

    // Filter projects that have the current quarter in their quarters array
    return regularProjectsData.filter((projectData) => {
      const project = plannerData?.projects.find((p) => p.id === projectData.id);
      return project?.quarters?.includes(currentQuarterString) || false;
    });
  }, [regularProjectsData, filterByCurrentQuarter, currentQuarterString, plannerData]);

  // Combine filtered regular projects with default projects (always shown)
  const filteredProjectData = useMemo(() => {
    return [...filteredRegularProjects, ...defaultProjectsData];
  }, [filteredRegularProjects, defaultProjectsData]);

  // Calculate allocated values and update capacity data
  const finalRoleCapacityData = useMemo(() => {
    // Start with a copy of the initial data
    let updatedCapacityData = { ...roleCapacityData };
    const updatedProjects = { ...projectDataMap };

    // Filter assignments to only include those for the current quarter and year
    const currentQuarterAssignments = assignments.filter(
      (assignment) => assignment.quarter === currentQuarter && assignment.year === currentYear,
    );

    // Separate regular and default project assignments
    const regularAssignments = currentQuarterAssignments.filter(
      (assignment) => !isDefaultProject(assignment.projectId),
    );
    const defaultProjectAssignments = currentQuarterAssignments.filter((assignment) =>
      isDefaultProject(assignment.projectId),
    );

    // Process all assignments to update project allocation displays
    currentQuarterAssignments.forEach((assignment) => {
      const assigneeRole = assigneeRoles[assignment.assigneeId];
      const projectDetail = updatedProjects[assignment.projectId];

      if (assigneeRole && projectDetail && ROLES_TO_DISPLAY.includes(assigneeRole)) {
        // Update project allocation (immutably)
        updatedProjects[assignment.projectId] = {
          ...projectDetail,
          allocations: {
            ...projectDetail.allocations,
            [assigneeRole]: {
              ...projectDetail.allocations[assigneeRole],
              allocated: projectDetail.allocations[assigneeRole].allocated + 1,
            },
          },
        };
      }
    });

    // Process only regular assignments for capacity calculations
    regularAssignments.forEach((assignment) => {
      const assigneeRole = assigneeRoles[assignment.assigneeId];

      if (assigneeRole && ROLES_TO_DISPLAY.includes(assigneeRole)) {
        // Update capacity data with only regular project allocations (immutably)
        updatedCapacityData = {
          ...updatedCapacityData,
          [assigneeRole]: {
            ...updatedCapacityData[assigneeRole],
            totalAllocated: updatedCapacityData[assigneeRole].totalAllocated + 1,
          },
        };
      }
    });

    // Reduce capacity by default project assignments
    defaultProjectAssignments.forEach((assignment) => {
      const assigneeRole = assigneeRoles[assignment.assigneeId];

      if (assigneeRole && ROLES_TO_DISPLAY.includes(assigneeRole)) {
        // Reduce capacity by default project time (immutably)
        updatedCapacityData = {
          ...updatedCapacityData,
          [assigneeRole]: {
            ...updatedCapacityData[assigneeRole],
            capacity: Math.max(0, updatedCapacityData[assigneeRole].capacity - 1),
          },
        };
      }
    });

    // Calculate total estimated across all projects (use filtered projects for display)
    const projectsToDisplay = filteredProjectData
      .map((p) => updatedProjects[p.id])
      .filter((projectData): projectData is ProjectDisplayData => projectData !== undefined);

    const finalCapacityData = ROLES_TO_DISPLAY.reduce((acc, role) => {
      const totalEstimated = projectsToDisplay.reduce(
        (sum, projectData) => sum + projectData.allocations[role].estimated,
        0,
      );

      return {
        ...acc,
        [role]: {
          ...acc[role],
          totalEstimated,
        },
      };
    }, updatedCapacityData);

    return { capacityData: finalCapacityData, updatedProjects };
  }, [roleCapacityData, projectDataMap, assignments, assigneeRoles, filteredProjectData, currentYear, currentQuarter]);

  const handleEstimateUpdate = useCallback(
    (projectId: string, role: Role, value: number) => {
      if (onUpdateEstimate) {
        onUpdateEstimate(projectId, role, value);
      }
    },
    [onUpdateEstimate],
  );

  // Handle paint mode activation for a project
  const handlePaintProject = useCallback(
    (projectId: string) => {
      setMode('paint');
      setSelectedProjectId(projectId);
    },
    [setMode, setSelectedProjectId],
  );

  if (!plannerData) {
    return null;
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Project Allocation Summary (Weeks)</h1>
      <div className="flex items-center gap-2 mb-4">
        <Switch id="filter-projects" checked={filterByCurrentQuarter} onCheckedChange={setFilterByCurrentQuarter} />
        <Label htmlFor="filter-projects" className="text-sm">
          Only Q{currentQuarter} {currentYear} projects
          {filterByCurrentQuarter && (
            <span className="text-muted-foreground ml-1">
              ({filteredRegularProjects.length} of {regularProjectsData.length} regular projects +{' '}
              {defaultProjectsData.length} default projects)
            </span>
          )}
          {!filterByCurrentQuarter && (
            <span className="text-muted-foreground ml-1">
              ({regularProjectsData.length} regular + {defaultProjectsData.length} default projects)
            </span>
          )}
        </Label>
      </div>
      <Table className="min-w-full text-xs">
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="w-[70px] whitespace-nowrap py-1 px-2">Slug</TableHead>
            <TableHead className="w-[200px] whitespace-nowrap py-1 px-2">
              <div className="flex flex-col">
                <span>Project</span>
                <span className="text-xs text-muted-foreground font-normal">Quarter: {weeksInQuarter} weeks</span>
              </div>
            </TableHead>
            {ROLES_TO_DISPLAY.map((role) => {
              const data = finalRoleCapacityData.capacityData[role];
              const capacityUtilization = data.capacity > 0 ? (data.totalAllocated / data.capacity) * 100 : 0;
              const isOverCapacity = data.totalAllocated > data.capacity;
              const isUnderUtilized = capacityUtilization < 80 && data.capacity > 0;

              return (
                <TableHead key={role} className="text-center whitespace-nowrap py-1 px-2 w-[120px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{formatRoleName(role)}</span>
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <span className="text-muted-foreground">Est:</span>
                      <span
                        className={cn(
                          'font-medium',
                          data.totalEstimated > data.capacity && 'text-red-600 dark:text-red-400',
                          data.totalEstimated < data.capacity * 0.8 &&
                            data.capacity > 0 &&
                            'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {data.totalEstimated}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">Alloc:</span>
                      <span
                        className={cn(
                          'font-medium',
                          isOverCapacity && 'text-red-600 dark:text-red-400',
                          isUnderUtilized && 'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {data.totalAllocated}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <span className="text-muted-foreground">Cap:</span>
                      <span className="font-medium">{data.capacity}</span>
                      <span className="text-muted-foreground">({capacityUtilization.toFixed(0)}%)</span>
                      {isOverCapacity && <TrendingUpIcon className="h-3 w-3 text-red-500" />}
                      {isUnderUtilized && <TrendingDownIcon className="h-3 w-3 text-amber-500" />}
                    </div>
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Regular Projects */}
          {filteredRegularProjects.map((projectData) => {
            // Get project color for gradient
            const project = plannerData.projects.find((p) => p.id === projectData.id);
            const { classes: projectStyles } = getProjectStyles(project);

            // Get the updated project data with allocations
            const updatedProjectData = finalRoleCapacityData.updatedProjects[projectData.id] || projectData;

            // Check if this project is selected for painting
            const isPaintingProject = mode === 'paint' && selectedProjectId === projectData.id;

            return (
              <TableRow key={projectData.id} className="h-8">
                <TableCell
                  className={cn(
                    'w-[70px] whitespace-nowrap py-1 px-2 overflow-hidden truncate text-xs relative',
                    projectStyles,
                  )}
                >
                  <span className="relative z-10 font-medium">{projectData.slug}</span>
                </TableCell>
                <TableCell className="font-medium w-[200px] whitespace-nowrap py-1 px-2 overflow-hidden truncate">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isPaintingProject ? 'default' : 'ghost'}
                      className={cn('h-6 w-6 p-0 shrink-0', isPaintingProject && 'bg-primary text-primary-foreground')}
                      onClick={() => handlePaintProject(projectData.id)}
                      title={isPaintingProject ? 'Painting mode active' : 'Enable painting mode'}
                    >
                      <PaintBucket className="h-3 w-3" />
                    </Button>
                    <Link href={`/projects/${projectData.id}`} className="hover:underline flex-1 min-w-0">
                      <div className="flex items-center min-w-0">
                        {projectData.icon && <span className="mr-2 shrink-0">{projectData.icon}</span>}
                        <span className="truncate">{projectData.name}</span>
                      </div>
                    </Link>
                  </div>
                </TableCell>
                {ROLES_TO_DISPLAY.map((role) => {
                  const data = updatedProjectData.allocations[role];
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

          {/* Separator row if both regular and default projects exist */}
          {filteredRegularProjects.length > 0 && defaultProjectsData.length > 0 && (
            <TableRow className="h-6">
              <TableCell colSpan={2 + ROLES_TO_DISPLAY.length} className="py-1 px-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border"></div>
                  <span className="text-xs text-muted-foreground font-medium">Default Projects</span>
                  <div className="flex-1 border-t border-border"></div>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Default Projects */}
          {defaultProjectsData.map((projectData) => {
            // Get project color for gradient
            const project = DEFAULT_PROJECTS.find((p) => p.id === projectData.id);
            const projectColor = getProjectColorByName(project?.color) || getDefaultProjectColor();
            const colorHex = projectColor.hex;
            const { classes: projectStyles } = getProjectStyles(project);

            // Get the updated project data with allocations
            const updatedProjectData = finalRoleCapacityData.updatedProjects[projectData.id] || projectData;

            // Check if this project is selected for painting
            const isPaintingProject = mode === 'paint' && selectedProjectId === projectData.id;

            return (
              <TableRow key={projectData.id} className="h-8 bg-muted/20">
                <TableCell
                  className={cn(
                    'w-[70px] whitespace-nowrap py-1 px-2 overflow-hidden truncate text-xs relative',
                    projectStyles,
                  )}
                >
                  {/* Gradient background */}
                  <div
                    className="absolute inset-0 opacity-15 dark:opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${colorHex} 0%, transparent 60%)`,
                    }}
                  />
                  <span className="relative z-10 font-medium">{projectData.slug}</span>
                </TableCell>
                <TableCell className="font-medium w-[200px] whitespace-nowrap py-1 px-2 overflow-hidden truncate">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isPaintingProject ? 'default' : 'ghost'}
                      className={cn('h-6 w-6 p-0 shrink-0', isPaintingProject && 'bg-primary text-primary-foreground')}
                      onClick={() => handlePaintProject(projectData.id)}
                      title={isPaintingProject ? 'Painting mode active' : 'Enable painting mode'}
                    >
                      <PaintBucket className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center flex-1 min-w-0">
                      {projectData.icon && <span className="mr-2 shrink-0">{projectData.icon}</span>}
                      <span className="text-muted-foreground truncate">{projectData.name}</span>
                    </div>
                  </div>
                </TableCell>
                {ROLES_TO_DISPLAY.map((role) => {
                  const data = updatedProjectData.allocations[role];

                  return (
                    <TableCell key={role} className="text-center whitespace-nowrap py-1 px-2 w-[120px]">
                      <div className="flex items-center justify-center gap-1 min-h-[24px]">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">Est:</span>
                          <span className="text-xs text-muted-foreground">-</span>
                        </div>
                        <span className="text-muted-foreground">/</span>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">Alloc:</span>
                          <span className="text-xs min-w-[12px] text-center">{data.allocated}</span>
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
            <span className="text-red-600 dark:text-red-400">Red: Overallocated/Over capacity</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDownIcon className="h-3 w-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">Amber: Underallocated/Under-utilized (&lt;80%)</span>
          </div>
        </div>
        <p>
          Click on estimate values to edit them inline. Capacity is calculated as (number of assignees × weeks in
          quarter) minus time allocated to default projects.
        </p>
        <p>
          Default projects (vacation, duty, etc.) reduce available capacity and don&apos;t count toward allocation
          metrics.
        </p>
        <p>Click the paint bucket icon next to any project to enable painting mode for that project.</p>
      </div>
    </div>
  );
}
