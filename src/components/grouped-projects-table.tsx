'use client';

import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { TeamSelector, TeamOption } from '@/components/team-selector';
import { Project } from '@/lib/types';
import { ProjectGroup } from '@/lib/utils/group-projects';
import { useState, useEffect } from 'react';
import { ProjectAreaSelector } from './project-area-selector';
import { PrioritySelector } from './priroty-selector';
import { QuarterSelector } from './quarter-selector';

interface GroupedProjectsTableProps {
  groups: ProjectGroup[];
  isGrouped: boolean;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
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
          <TableBody>
            {allProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-16 text-center text-xs">
                  No projects found.
                </TableCell>
              </TableRow>
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
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[150px]">Quarter</TableHead>
                    <TableHead className="w-[200px]">Team</TableHead>
                    <TableHead className="w-[100px]">Lead</TableHead>
                    <TableHead className="w-[100px]">Dependencies</TableHead>
                    <TableHead className="w-[200px]">Area</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-16 text-center text-xs">
                        No projects in this group.
                      </TableCell>
                    </TableRow>
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

  return (
    <TableRow>
      <TableCell className="py-1 px-2 font-medium">
        <Link href={`/projects/${project.id}`} className="block cursor-pointer hover:underline">
          {project.name}
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
          isIconEnabled={false}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        {onUpdateProject ? (
          <TeamSelector
            type="inline"
            value={project.teamId}
            onSelect={handleTeamChange}
            placeholder="Select team"
            // className="text-xs"
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
  );
}
