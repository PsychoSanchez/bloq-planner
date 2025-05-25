'use client';

import { useEffect, useState } from 'react';
import { parseAsString, parseAsBoolean, parseAsArrayOf, useQueryState } from 'nuqs';
import { SearchProjects } from '@/components/search-projects';
import { GroupedProjectsTable } from '@/components/grouped-projects-table';
import { Project } from '@/lib/types';
import { groupProjects } from '@/lib/utils/group-projects';
import { GroupByOption } from '@/components/project-group-selector';
import { SortByOption, SortDirectionOption } from '@/components/project-sort-selector';
import { TeamOption } from '@/components/team-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const EMPTY_ARRAY = [] as string[];

// Skeleton component for loading state
function ProjectsTableSkeleton({ isGrouped }: { isGrouped: boolean }) {
  const skeletonRows = Array.from({ length: 8 }, (_, i) => i);

  if (isGrouped) {
    return (
      <div className="space-y-4">
        {/* Group 1 */}
        <div className="rounded-sm border">
          <div className="flex items-center gap-2 p-3 bg-muted/50">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16 ml-2" />
          </div>
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
              {skeletonRows.slice(0, 4).map((index) => (
                <TableRow key={`group1-${index}`}>
                  <TableCell className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Group 2 */}
        <div className="rounded-sm border">
          <div className="flex items-center gap-2 p-3 bg-muted/50">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-14 ml-2" />
          </div>
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
              {skeletonRows.slice(0, 3).map((index) => (
                <TableRow key={`group2-${index}`}>
                  <TableCell className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-18" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Non-grouped skeleton
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
          {skeletonRows.map((index) => (
            <TableRow key={index}>
              <TableCell className="py-2 px-2">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <Skeleton className="h-3 w-3" />
                </div>
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell className="py-2 px-2">
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ProjectsPageContent() {
  // Basic filters
  const [search] = useQueryState('search', parseAsString.withDefault(''));
  const [type] = useQueryState('type', parseAsString.withDefault('all'));
  const [includeArchived] = useQueryState('includeArchived', parseAsBoolean.withDefault(false));

  // View controls
  const [groupBy] = useQueryState('groupBy', parseAsString.withDefault('none'));
  const [sortBy] = useQueryState('sortBy', parseAsString.withDefault('name'));
  const [sortDirection] = useQueryState('sortDirection', parseAsString.withDefault('asc'));

  // Advanced multidimensional filters
  const [priorities] = useQueryState('priorities', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [quarters] = useQueryState('quarters', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [areas] = useQueryState('areas', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [leads] = useQueryState('leads', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));

  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Basic filters
        if (search) params.set('search', search);
        if (type && type !== 'all') params.set('type', type);
        if (includeArchived) params.set('includeArchived', 'true');

        // Advanced multidimensional filters
        if (priorities.length > 0) params.set('priorities', priorities.join(','));
        if (quarters.length > 0) params.set('quarters', quarters.join(','));
        if (areas.length > 0) params.set('areas', areas.join(','));
        if (leads.length > 0) params.set('leads', leads.join(','));

        const queryParams = params.toString();
        const response = await fetch(`/api/projects${queryParams ? `?${queryParams}` : ''}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        } else {
          console.error('Failed to fetch projects');
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [search, type, includeArchived, priorities, quarters, areas, leads]);

  useEffect(() => {
    const fetchTeams = async () => {
      setTeamsLoading(true);
      try {
        const response = await fetch('/api/team-members');
        if (response.ok) {
          const data = await response.json();
          // Convert team members to team options, focusing on teams and departments
          const teamOptions: TeamOption[] = data
            .filter((member: TeamOption) => member.type === 'team' || member.type === 'person')
            .map((member: TeamOption) => ({
              id: member.id,
              name: member.name,
              department: member.department,
              type: member.type,
            }));
          setTeams(teamOptions);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update the local state
        setProjects((prevProjects) =>
          prevProjects.map((project) => (project.id === projectId ? { ...project, ...updates } : project)),
        );
      } else {
        console.error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  // Group projects based on the selected groupBy option
  const groups = groupProjects(
    projects,
    groupBy as GroupByOption,
    sortBy as SortByOption,
    sortDirection as SortDirectionOption,
  );
  const isGrouped = groupBy !== 'none';

  return (
    <div className="space-y-4">
      <SearchProjects teams={teams} teamsLoading={teamsLoading} />
      {loading ? (
        <ProjectsTableSkeleton isGrouped={isGrouped} />
      ) : (
        <GroupedProjectsTable
          groups={groups}
          isGrouped={isGrouped}
          onUpdateProject={handleUpdateProject}
          teams={teams}
          teamsLoading={teamsLoading}
        />
      )}
    </div>
  );
}
