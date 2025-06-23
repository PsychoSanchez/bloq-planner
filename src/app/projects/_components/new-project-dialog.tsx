'use client';

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { TeamOption } from '@/components/team-multi-selector';
import { ProjectForm, ProjectFormData, ProjectFormRef } from '@/components/project-form';

export function NewProjectDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<ProjectFormRef>(null);

  // tRPC mutation for creating projects
  const utils = trpc.useUtils();
  const createProjectMutation = trpc.project.createProject.useMutation({
    onSuccess: (newProject) => {
      // Invalidate and refetch projects
      utils.project.getProjects.invalidate();

      // Show success toast
      toast({
        title: 'Project created successfully',
        description: `"${newProject.name}" has been created.`,
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);

      // Show error toast
      toast({
        title: 'Error creating project',
        description: error.message || 'An error occurred while creating the project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Use tRPC to fetch team members
  const {
    data: teamMembers,
    isLoading: teamsLoading,
    error: teamMembersError,
  } = trpc.team.getTeamMembers.useQuery({}, { enabled: open });

  // Convert team members to team options format
  const teams: TeamOption[] =
    teamMembers
      ?.filter((member) => member.type === 'team' || member.type === 'person')
      .map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        type: member.type as 'person' | 'team' | 'dependency' | 'event',
      })) || [];

  // Show error toast if team members fetch fails
  useEffect(() => {
    if (teamMembersError) {
      console.error('Error fetching teams:', teamMembersError);
    }
  }, [teamMembersError]);

  const handleSubmit = async (formData: ProjectFormData) => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Exclude ROI from form data since it's auto-calculated on backend
      const { roi, ...projectData } = formData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = roi; // Acknowledge that roi is intentionally unused

      await createProjectMutation.mutateAsync({
        ...projectData,
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

      setOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="px-4 gap-2">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new project to your planner.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ProjectForm
            ref={formRef}
            mode="create"
            teams={teams}
            teamsLoading={teamsLoading}
            onSubmit={handleSubmit}
            className="space-y-4"
          />
        </div>

        <DialogFooter>
          <Button onClick={handleDialogSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
