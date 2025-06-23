'use client';

import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon, ArchiveIcon, ExternalLinkIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TeamMultiSelector, TeamOption } from '@/components/team-multi-selector';
import { DependenciesMultiSelector } from '@/components/dependencies-multi-selector';
import { PersonSelector } from '@/components/person-selector';
import { Project } from '@/lib/types';
import { ProjectGroup } from '@/lib/utils/group-projects';
import { useState, useEffect } from 'react';
import { ProjectAreaSelector } from '@/components/project-area-selector';
import { PrioritySelector } from '@/components/priroty-selector';
import { QuarterMultiSelector } from '@/components/quarter-multi-selector';
import { cn } from '@/lib/utils';
import { PROJECT_AREAS } from '@/lib/constants';
import { ProjectDetailsSheet } from '@/components/project-details-sheet';
import { InlineCurrencyEditor } from '@/app/projects/_components/inline-currency-editor';
import { GroupByOption } from '@/app/projects/_components/project-group-selector';
import { ProjectContextMenu } from '@/app/projects/_components/project-context-menu';

interface GroupedProjectsTableProps {
  groups: ProjectGroup[];
  isGrouped: boolean;
  groupBy?: GroupByOption;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
  isColumnVisible: (columnId: string) => boolean;
}

function GroupedProjectsTableHeader({ isColumnVisible }: { isColumnVisible: (columnId: string) => boolean }) {
  const visibleColumns = [
    { id: 'name', label: 'Name', className: 'w-[300px] min-w-[300px]' },
    { id: 'priority', label: 'Priority', className: 'w-[100px]' },
    { id: 'quarter', label: 'Quarter', className: 'w-[200px]' },
    { id: 'team', label: 'Team', className: 'w-[200px]' },
    { id: 'lead', label: 'Lead', className: 'w-[200px]' },
    { id: 'dependencies', label: 'Dependencies', className: 'w-[200px]' },
    { id: 'area', label: 'Area', className: 'w-[200px]' },
    { id: 'cost', label: 'Cost', className: 'w-[100px]' },
    { id: 'impact', label: 'Impact', className: 'w-[100px]' },
    { id: 'roi', label: 'ROI', className: 'w-[80px]' },
  ].filter((column) => isColumnVisible(column.id));

  return (
    <TableHeader>
      <TableRow>
        {visibleColumns.map((column) => (
          <TableHead key={column.id} className={column.className}>
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function EmptyProjectRow({ isColumnVisible }: { isColumnVisible: (columnId: string) => boolean }) {
  const visibleColumnCount = [
    'name',
    'priority',
    'quarter',
    'team',
    'lead',
    'dependencies',
    'area',
    'cost',
    'impact',
    'roi',
  ].filter((columnId) => isColumnVisible(columnId)).length;

  return (
    <TableRow>
      <TableCell colSpan={visibleColumnCount} className="h-16 text-center text-xs">
        No projects found.
      </TableCell>
    </TableRow>
  );
}

export function GroupedProjectsTable({
  groups,
  isGrouped,
  groupBy,
  onUpdateProject,
  teams,
  teamsLoading,
  isColumnVisible,
}: GroupedProjectsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map((g) => g.label)));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Derive the current project from the projects array to ensure we always have fresh data
  const selectedProject = selectedProjectId
    ? groups.flatMap((g) => g.projects).find((p) => p.id === selectedProjectId) || null
    : null;

  // Function to get area icon for group headers
  const getAreaIcon = (groupLabel: string) => {
    if (groupBy !== 'area' || groupLabel === 'No Area') return null;

    // Find the area by name (since the label is now formatted)
    const area = PROJECT_AREAS.find((a) => a.name === groupLabel);
    return area ? area.icon : null;
  };

  // Ensure new groups are automatically expanded
  useEffect(() => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev);
      groups.forEach((group) => {
        if (!newExpanded.has(group.label)) {
          newExpanded.add(group.label);
        }
      });
      return newExpanded;
    });
  }, [groups]);

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const handleOpenSheet = (project: Project) => {
    setSelectedProjectId(project.id);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedProjectId(null);
  };

  if (!isGrouped) {
    // Render normal table without grouping
    const allProjects = groups[0]?.projects || [];
    return (
      <>
        <div className="rounded-sm border">
          <Table className="text-xs">
            <GroupedProjectsTableHeader isColumnVisible={isColumnVisible} />
            <TableBody>
              {allProjects.length === 0 ? (
                <EmptyProjectRow isColumnVisible={isColumnVisible} />
              ) : (
                allProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onUpdateProject={onUpdateProject}
                    teams={teams}
                    teamsLoading={teamsLoading}
                    onOpenSheet={handleOpenSheet}
                    isColumnVisible={isColumnVisible}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ProjectDetailsSheet
          project={selectedProject}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onUpdateProject={onUpdateProject}
          teams={teams}
          teamsLoading={teamsLoading}
        />
      </>
    );
  }

  // Render grouped table
  return (
    <>
      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          const AreaIcon = getAreaIcon(group.label);

          return (
            <div key={group.label} className="rounded-sm border">
              <div
                className="flex items-center justify-between p-1 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => toggleGroup(group.label)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                  {AreaIcon && <AreaIcon className="h-4 w-4" />}
                  <h3 className="font-medium text-sm">
                    {group.label}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({group.count} project{group.count !== 1 ? 's' : ''})
                    </span>
                  </h3>
                </div>
              </div>

              {isExpanded && (
                <Table className="text-xs">
                  <GroupedProjectsTableHeader isColumnVisible={isColumnVisible} />
                  <TableBody>
                    {group.projects.length === 0 ? (
                      <EmptyProjectRow isColumnVisible={isColumnVisible} />
                    ) : (
                      group.projects.map((project) => (
                        <ProjectRow
                          key={project.id}
                          project={project}
                          onUpdateProject={onUpdateProject}
                          teams={teams}
                          teamsLoading={teamsLoading}
                          onOpenSheet={handleOpenSheet}
                          isColumnVisible={isColumnVisible}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          );
        })}
      </div>
      <ProjectDetailsSheet
        project={selectedProject}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onUpdateProject={onUpdateProject}
        teams={teams}
        teamsLoading={teamsLoading}
      />
    </>
  );
}

function ProjectRow({
  project,
  onUpdateProject,
  teams,
  teamsLoading,
  onOpenSheet,
  isColumnVisible,
}: {
  project: Project;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
  onOpenSheet: (project: Project) => void;
  isColumnVisible: (columnId: string) => boolean;
}) {
  const handleTeamChange = (teamIds: string[]) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { teamIds });
    }
  };

  const handleLeadChange = (leadId: string) => {
    onUpdateProject?.(project.id, { leadId: leadId || undefined });
  };

  const handleDependenciesChange = (dependencyIds: string[]) => {
    // Convert string array to dependencies object format
    const dependencies = dependencyIds.map((teamId) => ({
      team: teamId,
      status: 'pending' as const,
      description: '',
    }));
    onUpdateProject?.(project.id, { dependencies });
  };

  return (
    <ProjectContextMenu project={project} teams={teams} onUpdateProject={onUpdateProject}>
      <TableRow className={cn('group', project.archived && 'opacity-60')}>
        {isColumnVisible('name') && (
          <TableCell className="py-1 px-2 font-medium">
            <div className="flex items-center gap-2 justify-between">
              <div
                className="flex items-center gap-2 cursor-pointer hover:underline flex-1"
                onClick={() => onOpenSheet(project)}
              >
                {project.archived && <ArchiveIcon className="h-3 w-3 text-muted-foreground" />}
                {project.name}
              </div>
              <Link
                href={`/projects/${project.id}`}
                className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>
          </TableCell>
        )}
        {isColumnVisible('priority') && (
          <TableCell className="py-1 px-2">
            <PrioritySelector
              type="inline"
              value={project.priority || 'medium'}
              onSelect={(value) =>
                onUpdateProject?.(project.id, { priority: value as 'low' | 'medium' | 'high' | 'urgent' })
              }
            />
          </TableCell>
        )}
        {isColumnVisible('quarter') && (
          <TableCell className="py-1 px-2">
            <QuarterMultiSelector
              type="inline"
              value={project.quarters || []}
              onSelect={(value) => onUpdateProject?.(project.id, { quarters: value })}
            />
          </TableCell>
        )}
        {isColumnVisible('team') && (
          <TableCell className="py-1 px-2">
            {onUpdateProject ? (
              <TeamMultiSelector
                type="inline"
                value={project.teamIds || []}
                onSelect={handleTeamChange}
                placeholder="Select teams"
                teams={teams}
                loading={teamsLoading}
                maxDisplayItems={2}
              />
            ) : project.teamIds && project.teamIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {project.teamIds.slice(0, 2).map((teamId) => {
                  const team = teams.find((t) => t.id === teamId);
                  return (
                    <span key={teamId} className="text-xs bg-muted px-1 py-0.5 rounded">
                      {team?.name || teamId}
                    </span>
                  );
                })}
                {project.teamIds.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{project.teamIds.length - 2}</span>
                )}
              </div>
            ) : (
              '--'
            )}
          </TableCell>
        )}
        {isColumnVisible('lead') && (
          <TableCell className="py-1 px-2">
            {onUpdateProject ? (
              <PersonSelector
                type="inline"
                value={project.leadId}
                onSelect={handleLeadChange}
                placeholder="Select lead"
                teams={teams}
                loading={teamsLoading}
              />
            ) : (
              teams.find((t) => t.id === project.leadId && t.type === 'person')?.name || '--'
            )}
          </TableCell>
        )}
        {isColumnVisible('dependencies') && (
          <TableCell className="py-1 px-2">
            {onUpdateProject ? (
              <DependenciesMultiSelector
                type="inline"
                value={project.dependencies?.map((dep) => dep.team) || []}
                onSelect={handleDependenciesChange}
                placeholder="Select dependencies"
                dependencies={teams}
                loading={teamsLoading}
                maxDisplayItems={2}
              />
            ) : project.dependencies && project.dependencies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {project.dependencies.slice(0, 2).map((dep, index) => {
                  const team = teams.find((t) => t.id === dep.team);
                  return (
                    <span key={index} className="text-xs bg-muted px-1 py-0.5 rounded">
                      {team?.name || dep.team}
                    </span>
                  );
                })}
                {project.dependencies.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{project.dependencies.length - 2}</span>
                )}
              </div>
            ) : (
              '--'
            )}
          </TableCell>
        )}
        {isColumnVisible('area') && (
          <TableCell className="py-1 px-2">
            <ProjectAreaSelector
              type="inline"
              value={project.area || ''}
              onSelect={(value) => onUpdateProject?.(project.id, { area: value })}
            />
          </TableCell>
        )}
        {isColumnVisible('cost') && (
          <TableCell className="py-1 px-2">
            {onUpdateProject ? (
              <InlineCurrencyEditor
                value={project.cost || 0}
                onSave={(value) => onUpdateProject(project.id, { cost: value })}
                placeholder="€0"
              />
            ) : project.cost ? (
              `€${project.cost.toLocaleString()}`
            ) : (
              '--'
            )}
          </TableCell>
        )}
        {isColumnVisible('impact') && (
          <TableCell className="py-1 px-2">
            {onUpdateProject ? (
              <InlineCurrencyEditor
                value={project.impact || 0}
                onSave={(value) => onUpdateProject(project.id, { impact: value })}
                placeholder="€0"
              />
            ) : project.impact ? (
              `€${project.impact.toLocaleString()}`
            ) : (
              '--'
            )}
          </TableCell>
        )}
        {isColumnVisible('roi') && (
          <TableCell className="py-1 px-2">{project.roi ? `${project.roi.toFixed(2)}x` : '--'}</TableCell>
        )}
      </TableRow>
    </ProjectContextMenu>
  );
}
