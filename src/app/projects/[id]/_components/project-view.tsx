'use client';

import { EditProjectForm } from '@/app/projects/[id]/_components/edit-project-form';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-selector';

interface ProjectViewProps {
  project: Project;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function ProjectView({ project, teams, teamsLoading }: ProjectViewProps) {
  return <EditProjectForm project={project} teams={teams} teamsLoading={teamsLoading} />;
}
