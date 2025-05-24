'use client';

import { useRouter } from 'next/navigation';
import { EditProjectForm } from '@/components/edit-project-form';
import { Project } from '@/lib/types';
import { TeamOption } from './team-selector';

interface ProjectViewProps {
  project: Project;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function ProjectView({ project, teams, teamsLoading }: ProjectViewProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/projects');
  };

  return <EditProjectForm project={project} onCancel={handleCancel} teams={teams} teamsLoading={teamsLoading} />;
}
