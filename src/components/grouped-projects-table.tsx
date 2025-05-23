'use client';

import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { Project } from '@/lib/types';
import { ProjectGroup } from '@/lib/utils/group-projects';
import { useState } from 'react';

interface GroupedProjectsTableProps {
  groups: ProjectGroup[];
  isGrouped: boolean;
}

export function GroupedProjectsTable({ groups, isGrouped }: GroupedProjectsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map((g) => g.label)));

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
              <TableHead className="w-[100px]">Team</TableHead>
              <TableHead className="w-[100px]">Lead</TableHead>
              <TableHead className="w-[100px]">Dependencies</TableHead>
              <TableHead className="w-[100px]">Area</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-16 text-center text-xs">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              allProjects.map((project) => <ProjectRow key={project.id} project={project} />)
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
              className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
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
                    <TableHead className="w-[100px]">Team</TableHead>
                    <TableHead className="w-[100px]">Lead</TableHead>
                    <TableHead className="w-[100px]">Dependencies</TableHead>
                    <TableHead className="w-[100px]">Area</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-16 text-center text-xs">
                        No projects in this group.
                      </TableCell>
                    </TableRow>
                  ) : (
                    group.projects.map((project) => <ProjectRow key={project.id} project={project} />)
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

function ProjectRow({ project }: { project: Project }) {
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
        <PriorityBadge priority={project.priority || 'medium'} />
      </TableCell>
      <TableCell className="py-1 px-2">{project.teamId || '--'}</TableCell>
      <TableCell className="py-1 px-2">{project.leadId || '--'}</TableCell>
      <TableCell className="py-1 px-2">{project.dependencies?.length || '--'}</TableCell>
      <TableCell className="py-1 px-2">{project.area || '--'}</TableCell>
    </TableRow>
  );
}
