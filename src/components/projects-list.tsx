'use client';

import { useEffect, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { GroupedProjectsTable } from '@/components/grouped-projects-table';
import { Project } from '@/lib/types';
import { groupProjects } from '@/lib/utils/group-projects';
import { GroupByOption } from '@/components/project-group-selector';

export function ProjectsList() {
  const [search] = useQueryState('search', parseAsString.withDefault(''));
  const [type] = useQueryState('type', parseAsString.withDefault('all'));
  const [groupBy] = useQueryState('groupBy', parseAsString.withDefault('none'));

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (type && type !== 'all') params.set('type', type);

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
  }, [search, type]);

  if (loading) {
    return <div className="text-center py-16 text-sm text-muted-foreground">Loading projects...</div>;
  }

  // Group projects based on the selected groupBy option
  const groups = groupProjects(projects, groupBy as GroupByOption);
  const isGrouped = groupBy !== 'none';

  return <GroupedProjectsTable groups={groups} isGrouped={isGrouped} />;
}
