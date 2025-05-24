'use client';

import { useEffect, useState } from 'react';
import { parseAsString, parseAsBoolean, useQueryState } from 'nuqs';
import { GroupedProjectsTable } from '@/components/grouped-projects-table';
import { Project } from '@/lib/types';
import { groupProjects } from '@/lib/utils/group-projects';
import { GroupByOption } from '@/components/project-group-selector';
import { TeamOption } from '@/components/team-selector';

export function ProjectsList() {
  const [search] = useQueryState('search', parseAsString.withDefault(''));
  const [type] = useQueryState('type', parseAsString.withDefault('all'));
  const [groupBy] = useQueryState('groupBy', parseAsString.withDefault('none'));
  const [includeArchived] = useQueryState('includeArchived', parseAsBoolean.withDefault(false));

  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (type && type !== 'all') params.set('type', type);
        if (includeArchived) params.set('includeArchived', 'true');

        const response = await fetch(`/api/projects?${params.toString()}`);
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
  }, [search, type, includeArchived]);

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

  if (loading) {
    return <div className="text-center py-16 text-sm text-muted-foreground">Loading projects...</div>;
  }

  // Group projects based on the selected groupBy option
  const groups = groupProjects(projects, groupBy as GroupByOption);
  const isGrouped = groupBy !== 'none';

  return (
    <GroupedProjectsTable
      groups={groups}
      isGrouped={isGrouped}
      onUpdateProject={handleUpdateProject}
      teams={teams}
      teamsLoading={teamsLoading}
    />
  );
}
