import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Project } from '@/lib/types';
import { trpc } from '@/utils/trpc';
import { toast } from '@/components/ui/use-toast';

interface UseOptimisticProjectsOptions {
  search?: string;
  type?: string;
  includeArchived?: boolean;
  priorities?: string[];
  quarters?: string[];
  areas?: string[];
  leads?: string[];
}

interface CreateProjectInput {
  name: string;
  slug: string;
  type: string;
  quarters?: string[];
  color?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  teamIds?: string[];
  leadId?: string;
  area?: string;
  dependencies?: unknown[];
  cost?: number | string;
  impact?: number | string;
  estimates?: unknown;
}

export function useOptimisticProjects(options: UseOptimisticProjectsOptions = {}) {
  // Local state for optimistic updates
  const [optimisticProjects, setOptimisticProjects] = useState<Project[]>([]);
  // Track temporary project IDs for creation
  const tempProjectsRef = useRef<Map<string, string>>(new Map());

  // Use tRPC to fetch projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = trpc.project.getProjects.useQuery({
    search: options.search || undefined,
    type: options.type !== 'all' ? options.type : undefined,
    includeArchived: options.includeArchived,
    priorities: options.priorities && options.priorities.length > 0 ? options.priorities : undefined,
    quarters: options.quarters && options.quarters.length > 0 ? options.quarters : undefined,
    areas: options.areas && options.areas.length > 0 ? options.areas : undefined,
    leads: options.leads && options.leads.length > 0 ? options.leads : undefined,
  });

  const serverProjects = useMemo(() => projectsData?.projects || [], [projectsData?.projects]);

  // Update local state when server data changes
  useEffect(() => {
    setOptimisticProjects(serverProjects);
  }, [serverProjects]);

  // Use optimistic projects if available, otherwise fall back to server projects
  const projects = optimisticProjects.length > 0 ? optimisticProjects : serverProjects;

  // tRPC utils for cache invalidation
  const utils = trpc.useUtils();

  // tRPC mutation for updating projects
  const updateProjectMutation = trpc.project.patchProject.useMutation({
    onSuccess: (updatedProject) => {
      // Update the optimistic state with the server response
      setOptimisticProjects((prev) =>
        prev.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
      );

      // Invalidate and refetch projects to ensure consistency
      utils.project.getProjects.invalidate();

      // Show success toast
      toast({
        title: 'Project updated successfully',
        description: `"${updatedProject.name}" has been updated.`,
      });
    },
    onError: (error, variables) => {
      console.error('Error updating project:', error);

      // Revert the optimistic update by restoring the original project
      const originalProject = serverProjects.find((p) => p.id === variables.id);
      if (originalProject) {
        setOptimisticProjects((prev) =>
          prev.map((project) => (project.id === variables.id ? originalProject : project)),
        );
      }

      // Show error toast
      toast({
        title: 'Failed to update project',
        description: error.message || 'There was an error updating the project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // tRPC mutation for creating projects
  const createProjectMutation = trpc.project.createProject.useMutation({
    onSuccess: (newProject, variables) => {
      // Find the temporary project ID for this creation
      const tempId = tempProjectsRef.current.get(variables.name + variables.slug);

      if (tempId) {
        // Replace the optimistic project with the real one from the server
        setOptimisticProjects((prev) => prev.map((project) => (project.id === tempId ? newProject : project)));

        // Clean up the temporary ID tracking
        tempProjectsRef.current.delete(variables.name + variables.slug);
      } else {
        // Fallback: just add the new project to the list
        setOptimisticProjects((prev) => [newProject, ...prev]);
      }

      // Invalidate and refetch projects to ensure consistency
      utils.project.getProjects.invalidate();

      // Show success toast
      toast({
        title: 'Project created successfully',
        description: `"${newProject.name}" has been created.`,
      });
    },
    onError: (error, variables) => {
      console.error('Error creating project:', error);

      // Find and remove the temporary project
      const tempId = tempProjectsRef.current.get(variables.name + variables.slug);

      if (tempId) {
        setOptimisticProjects((prev) => prev.filter((project) => project.id !== tempId));

        // Clean up the temporary ID tracking
        tempProjectsRef.current.delete(variables.name + variables.slug);
      }

      // Show error toast
      toast({
        title: 'Error creating project',
        description: error.message || 'An error occurred while creating the project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateProject = useCallback(
    async (projectId: string, updates: Partial<Project>) => {
      // Optimistic update: update the project immediately in local state
      setOptimisticProjects((prev) =>
        prev.map((project) => (project.id === projectId ? { ...project, ...updates } : project)),
      );

      try {
        await updateProjectMutation.mutateAsync({
          id: projectId,
          ...updates,
        });
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Error updating project:', error);
      }
    },
    [updateProjectMutation],
  );

  const createProject = useCallback(
    async (projectData: CreateProjectInput) => {
      // Generate a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const trackingKey = projectData.name + projectData.slug;

      // Track the temporary ID
      tempProjectsRef.current.set(trackingKey, tempId);

      const optimisticProject: Project = {
        id: tempId,
        name: projectData.name,
        slug: projectData.slug,
        type: projectData.type as Project['type'],
        quarters: projectData.quarters,
        color: projectData.color,
        description: projectData.description,
        priority: projectData.priority || 'medium',
        teamIds: projectData.teamIds,
        leadId: projectData.leadId,
        area: projectData.area,
        dependencies: projectData.dependencies as Project['dependencies'],
        cost: typeof projectData.cost === 'string' ? parseFloat(projectData.cost) || undefined : projectData.cost,
        impact:
          typeof projectData.impact === 'string' ? parseFloat(projectData.impact) || undefined : projectData.impact,
        roi: 0, // Will be calculated on backend
        estimates: projectData.estimates as Project['estimates'],
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update: add the project immediately
      setOptimisticProjects((prev) => [optimisticProject, ...prev]);

      try {
        await createProjectMutation.mutateAsync(projectData);
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Error creating project:', error);
        throw error; // Re-throw to handle in the component
      }
    },
    [createProjectMutation],
  );

  return {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    updateProject,
    createProject,
    isUpdating: updateProjectMutation.isPending,
    isCreating: createProjectMutation.isPending,
  };
}
