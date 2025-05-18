'use client';

import { useRouter } from 'next/navigation';
import { EditProjectForm } from '@/components/edit-project-form';
import { Project } from '@/lib/types';

interface ProjectViewProps {
  project: Project;
}

export function ProjectView({ project }: ProjectViewProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/projects');
  };

  return <EditProjectForm project={project} onCancel={handleCancel} />;
}
