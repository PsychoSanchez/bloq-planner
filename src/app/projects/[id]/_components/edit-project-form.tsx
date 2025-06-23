'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';
import { ProjectForm, ProjectFormData, ProjectFormRef } from '@/components/project-form';
import { Button } from '@/components/ui/button';
import { CheckIcon, ArrowLeftIcon, ArchiveIcon, ArchiveRestoreIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

interface EditProjectFormProps {
  project: Project;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function EditProjectForm({ project, teams, teamsLoading }: EditProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSlugValid, setIsSlugValid] = useState(true);
  const formRef = useRef<ProjectFormRef>(null);

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
          .map(([department, value]) => ({
            department,
            value: typeof value === 'string' ? parseInt(value, 10) || 0 : value,
          }))
          .filter(({ value }) => value > 0),
      });

      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation onError callback
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormStateChange = (hasChanges: boolean, isValid: boolean) => {
    setHasUnsavedChanges(hasChanges);
    setIsSlugValid(isValid);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to go back? Your changes will be lost.',
      );
      if (!confirmed) return;
    }
    router.back();
  };

  const handleSubmitClick = () => {
    formRef.current?.submit();
  };

  const handleToggleArchive = () => {
    formRef.current?.handleToggleArchive();
  };

  return (
    <div className="space-y-6">
      {/* External buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Button type="button" variant="outline" size="sm" onClick={handleCancel} className="text-xs px-2 py-1 h-auto">
            <ArrowLeftIcon className="h-3 w-3 mr-1" />
            Back
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleArchive}
            className="text-xs px-2 py-1 h-auto"
          >
            {project.archived ? (
              <>
                <ArchiveRestoreIcon className="h-3 w-3 mr-1" />
                Unarchive
              </>
            ) : (
              <>
                <ArchiveIcon className="h-3 w-3 mr-1" />
                Archive
              </>
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={isSubmitting || !hasUnsavedChanges || !isSlugValid}
          onClick={handleSubmitClick}
          className={cn(
            'text-xs px-2 py-1 h-auto transition-all',
            hasUnsavedChanges && 'ring-2 ring-blue-500/20 shadow-sm',
          )}
        >
          <CheckIcon className="h-3 w-3 mr-1" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <ProjectForm
        ref={formRef}
        mode="edit"
        initialData={project}
        teams={teams}
        teamsLoading={teamsLoading}
        onSubmit={handleSubmit}
        onFormStateChange={handleFormStateChange}
        showCreatedDate={true}
      />
    </div>
  );
}
