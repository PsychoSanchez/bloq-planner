'use client';

import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon, ArchiveIcon, ArchiveRestoreIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { TeamSelector, TeamOption } from '@/components/team-selector';
import { Project } from '@/lib/types';
import { ProjectGroup } from '@/lib/utils/group-projects';
import { useState, useEffect } from 'react';
import { ProjectAreaSelector } from './project-area-selector';
import { PrioritySelector } from './priroty-selector';
import { QuarterSelector } from './quarter-selector';
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

interface GroupedProjectsTableProps {
  groups: ProjectGroup[];
  isGrouped: boolean;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
}

function GroupedProjectsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="min-w-[200px]">Name</TableHead>
        <TableHead className="w-[100px]">Type</TableHead>
        <TableHead className="w-[100px]">Priority</TableHead>
        <TableHead className="w-[150px]">Quarter</TableHead>
        <TableHead className="w-[150px]">Team</TableHead>
        <TableHead className="w-[100px]">Lead</TableHead>
        <TableHead className="w-[100px]">Dependencies</TableHead>
        <TableHead className="w-[200px]">Area</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function EmptyProjectRow() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-16 text-center text-xs">
        No projects found.
      </TableCell>
    </TableRow>
  );
}

export function GroupedProjectsTable({
  groups,
  isGrouped,
  onUpdateProject,
  teams,
  teamsLoading,
}: GroupedProjectsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map((g) => g.label)));

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

  if (!isGrouped) {
    // Render normal table without grouping
    const allProjects = groups[0]?.projects || [];
    return (
      <div className="rounded-sm border">
        <Table className="text-xs">
          <GroupedProjectsTableHeader />
          <TableBody>
            {allProjects.length === 0 ? (
              <EmptyProjectRow />
            ) : (
              allProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onUpdateProject={onUpdateProject}
                  teams={teams}
                  teamsLoading={teamsLoading}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Render grouped table
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.label);
        return (
          <div key={group.label} className="rounded-sm border">
            <div
              className="flex items-center justify-between p-1 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => toggleGroup(group.label)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
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
                <GroupedProjectsTableHeader />
                <TableBody>
                  {group.projects.length === 0 ? (
                    <EmptyProjectRow />
                  ) : (
                    group.projects.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        onUpdateProject={onUpdateProject}
                        teams={teams}
                        teamsLoading={teamsLoading}
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
  );
}

function ProjectRow({
  project,
  onUpdateProject,
  teams,
  teamsLoading,
}: {
  project: Project;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
}) {
  const handleTeamChange = (teamId: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { teamId });
    }
  };

  const handlePriorityChange = (priority: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { priority: priority as 'low' | 'medium' | 'high' | 'urgent' });
    }
  };

  const handleQuarterChange = (quarter: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { quarter });
    }
  };

  const handleAreaChange = (area: string) => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { area });
    }
  };

  const handleArchiveToggle = () => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { archived: !project.archived });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className={cn(project.archived && 'opacity-60')}>
          <TableCell className="py-1 px-2 font-medium">
            <Link href={`/projects/${project.id}`} className="block cursor-pointer hover:underline">
              <div className="flex items-center gap-2">
                {project.archived && <ArchiveIcon className="h-3 w-3 text-muted-foreground" />}
                {project.name}
              </div>
            </Link>
          </TableCell>
          <TableCell className="py-1 px-2">
            <ProjectTypeBadge type={project.type} />
          </TableCell>
          <TableCell className="py-1 px-2">
            <PrioritySelector
              type="inline"
              value={project.priority || 'medium'}
              onSelect={(value) =>
                onUpdateProject?.(project.id, { priority: value as 'low' | 'medium' | 'high' | 'urgent' })
              }
            />
          </TableCell>
          <TableCell className="py-1 px-2">
            <QuarterSelector
              type="inline"
              value={project.quarter || ''}
              onSelect={(value) => onUpdateProject?.(project.id, { quarter: value })}
            />
          </TableCell>
          <TableCell className="py-1 px-2">
            {onUpdateProject ? (
              <TeamSelector
                type="inline"
                value={project.teamId}
                onSelect={handleTeamChange}
                placeholder="Select team"
                teams={teams}
                loading={teamsLoading}
              />
            ) : (
              project.teamId || '--'
            )}
          </TableCell>
          <TableCell className="py-1 px-2">{project.leadId || '--'}</TableCell>
          <TableCell className="py-1 px-2">{project.dependencies?.length || '--'}</TableCell>
          <TableCell className="py-1 px-2">
            <ProjectAreaSelector
              type="inline"
              value={project.area || ''}
              onSelect={(value) => onUpdateProject?.(project.id, { area: value })}
            />
          </TableCell>
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
                  {QUARTER_OPTIONS.find((q) => q.value === project.quarter)?.name || 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleQuarterChange('')} className="text-muted-foreground">
                Remove Quarter
              </ContextMenuItem>
              <ContextMenuSeparator />
              {QUARTER_OPTIONS.map((quarter) => (
                <ContextMenuItem key={quarter.id} onClick={() => handleQuarterChange(quarter.value)}>
                  {quarter.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Team Section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                Team
                <span className="ml-auto text-xs text-muted-foreground">
                  {teams.find((t) => t.id === project.teamId)?.name || 'None'}
                </span>
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleTeamChange('')} className="text-muted-foreground">
                Remove Team
              </ContextMenuItem>
              <ContextMenuSeparator />
              {teams.map((team) => (
                <ContextMenuItem key={team.id} onClick={() => handleTeamChange(team.id)}>
                  {team.name}
                </ContextMenuItem>
              ))}
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
