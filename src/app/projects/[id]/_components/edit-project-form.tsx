'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';
import { ProjectForm, ProjectFormData } from '@/components/project-form';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/utils/trpc';

interface EditProjectFormProps {
  project: Project;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function EditProjectForm({ project, teams, teamsLoading }: EditProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC mutation for updating projects
  const utils = trpc.useUtils();
  const updateProjectMutation = trpc.project.patchProject.useMutation({
    onSuccess: (updatedProject) => {
      // Invalidate and refetch projects
      utils.project.getProjects.invalidate();

      // Show success toast
      toast({
        title: 'Project updated successfully',
        description: `"${updatedProject.name}" has been saved with your changes.`,
      });
    },
    onError: (error) => {
      console.error('Error updating project:', error);

      // Show error toast
      toast({
        title: 'Failed to update project',
        description: error.message || 'There was an error saving your changes. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (formData: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      // Exclude ROI from form data since it's auto-calculated on backend
      const { roi, ...updateData } = formData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = roi; // Acknowledge that roi is intentionally unused

      await updateProjectMutation.mutateAsync({
        id: project.id,
        ...updateData,
        cost: typeof formData.cost === 'string' ? parseFloat(formData.cost) || undefined : formData.cost,
        impact: typeof formData.impact === 'string' ? parseFloat(formData.impact) || undefined : formData.impact,
        dependencies: formData.dependencies
          ? formData.dependencies.map((dep) => ({
              team: dep,
              status: 'pending' as const,
              description: '',
            }))
          : [],
        estimates: Object.entries(formData.estimates)
          .filter(([, value]) => value > 0)
          .map(([department, value]) => ({
            department,
            value,
          })),
      });

      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation onError callback
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProjectForm
      mode="edit"
      initialData={project}
      teams={teams}
      teamsLoading={teamsLoading}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      showBackButton={true}
      showArchiveButton={true}
      showCreatedDate={true}
      showUnsavedChanges={true}
    />
  );
}
