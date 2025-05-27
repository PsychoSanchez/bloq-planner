'use client';

import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon, ArchiveIcon, ArchiveRestoreIcon, ExternalLinkIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectTypeBadge } from '@/components/project-type-badge';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { PRIORITY_OPTIONS, QUARTER_OPTIONS, PROJECT_AREAS } from '@/lib/constants';
import { ProjectDetailsSheet } from '@/app/projects/_components/project-details-sheet';
import { InlineCurrencyEditor } from '@/app/projects/_components/inline-currency-editor';
import { GroupByOption } from '@/app/projects/_components/project-group-selector';

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
    { id: 'type', label: 'Type', className: 'w-[100px]' },
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
    'type',
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

  const handlePriorityChange = (priority: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { priority: priority as 'low' | 'medium' | 'high' | 'urgent' });
    }
  };

  const handleQuarterChange = (quarter: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { quarters: quarter ? [quarter] : [] });
    }
  };

  const handleAreaChange = (area: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { area });
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

  const handleArchiveToggle = () => {
    onUpdateProject?.(project.id, { archived: !project.archived });
  };

  const handleTeamToggle = (teamId: string) => {
    const currentTeams = project.teamIds || [];
    const newTeams = currentTeams.includes(teamId)
      ? currentTeams.filter((id) => id !== teamId)
      : [...currentTeams, teamId];
    handleTeamChange(newTeams);
  };

  const handleDependencyToggle = (teamId: string) => {
    const currentDependencies = project.dependencies?.map((dep) => dep.team) || [];
    const newDependencies = currentDependencies.includes(teamId)
      ? currentDependencies.filter((id) => id !== teamId)
      : [...currentDependencies, teamId];
    handleDependenciesChange(newDependencies);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
          {isColumnVisible('type') && (
            <TableCell className="py-1 px-2">
              <ProjectTypeBadge type={project.type} />
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
      </ContextMenuTrigger>

      {onUpdateProject && (
        <ContextMenuContent className="w-64">
          {/* Priority Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Priority
                <span className="ml-auto text-xs text-muted-foreground">
                  {PRIORITY_OPTIONS.find((p) => p.id === (project.priority || 'medium'))?.name}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {PRIORITY_OPTIONS.map((priority) => (
                <ContextMenuItem
                  key={priority.id}
                  onClick={() => handlePriorityChange(priority.id)}
                  className="flex items-center gap-2"
                >
                  <priority.icon className={cn('h-4 w-4', priority.cn)} />
                  <span className={cn('', priority.cn)}>{priority.name}</span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Quarter Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Quarter
                <span className="ml-auto text-xs text-muted-foreground">
                  {QUARTER_OPTIONS.find(
                    (q) => q.value === (project.quarters && project.quarters.length > 0 ? project.quarters[0] : ''),
                  )?.name || 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {QUARTER_OPTIONS.map((quarter) => (
                <ContextMenuItem key={quarter.id} onClick={() => handleQuarterChange(quarter.value)}>
                  {quarter.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Teams Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Teams
                <span className="ml-auto text-xs text-muted-foreground">
                  {project.teamIds && project.teamIds.length > 0 ? `${project.teamIds.length} selected` : 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleTeamChange([])} className="text-muted-foreground">
                Clear All Teams
              </ContextMenuItem>
              <ContextMenuSeparator />
              {teams
                .filter((team) => team.type === 'team')
                .map((team) => {
                  const isSelected = project.teamIds?.includes(team.id) || false;
                  return (
                    <ContextMenuItem
                      key={team.id}
                      onClick={() => handleTeamToggle(team.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          'w-4 h-4 border rounded-sm flex items-center justify-center',
                          isSelected && 'bg-primary border-primary',
                        )}
                      >
                        {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                      </div>
                      {team.name}
                    </ContextMenuItem>
                  );
                })}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Dependencies Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Dependencies
                <span className="ml-auto text-xs text-muted-foreground">
                  {project.dependencies && project.dependencies.length > 0
                    ? `${project.dependencies.length} selected`
                    : 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleDependenciesChange([])} className="text-muted-foreground">
                Clear All Dependencies
              </ContextMenuItem>
              <ContextMenuSeparator />
              {teams.map((team) => {
                const isSelected = project.dependencies?.some((dep) => dep.team === team.id) || false;
                return (
                  <ContextMenuItem
                    key={team.id}
                    onClick={() => handleDependencyToggle(team.id)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border rounded-sm flex items-center justify-center',
                        isSelected && 'bg-primary border-primary',
                      )}
                    >
                      {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                    </div>
                    {team.name}
                  </ContextMenuItem>
                );
              })}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Area Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Area
                <span className="ml-auto text-xs text-muted-foreground">
                  {PROJECT_AREAS.find((a) => a.id === project.area)?.name || 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleAreaChange('')} className="text-muted-foreground">
                Remove Area
              </ContextMenuItem>
              <ContextMenuSeparator />
              {PROJECT_AREAS.map((area) => (
                <ContextMenuItem
                  key={area.id}
                  onClick={() => handleAreaChange(area.id)}
                  className="flex items-center gap-2"
                >
                  <area.icon className="h-4 w-4" />
                  {area.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Lead Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Lead
                <span className="ml-auto text-xs text-muted-foreground">
                  {teams.find((t) => t.id === project.leadId && t.type === 'person')?.name || 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleLeadChange('')} className="text-muted-foreground">
                Remove Lead
              </ContextMenuItem>
              <ContextMenuSeparator />
              {teams
                .filter((t) => t.type === 'person')
                .map((person) => (
                  <ContextMenuItem key={person.id} onClick={() => handleLeadChange(person.id)}>
                    {person.name}
                  </ContextMenuItem>
                ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          {/* Archive/Unarchive Action */}
          <ContextMenuItem onClick={handleArchiveToggle} className="flex items-center gap-2">
            {project.archived ? (
              <>
                <ArchiveRestoreIcon className="h-4 w-4" />
                Unarchive Project
              </>
            ) : (
              <>
                <ArchiveIcon className="h-4 w-4" />
                Archive Project
              </>
            )}
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
