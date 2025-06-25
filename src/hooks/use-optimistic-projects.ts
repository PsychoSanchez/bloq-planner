import { useCallback, useMemo } from 'react';
import { Project } from '@/lib/types';
import { RouterInput, trpc } from '@/utils/trpc';

type UpdateProjectInput = RouterInput['project']['patchProject'];
type GetProjectsInput = RouterInput['project']['getProjects'];

type UseOptimisticProjectsOptions = GetProjectsInput;

const undefinedIfEmpty = (value: string[] | undefined) => (value && value.length > 0 ? value : undefined);

export function useOptimisticProjects(options: UseOptimisticProjectsOptions = {}) {
  // Build query input for consistent query key generation
  const queryInput = useMemo(
    () => ({
      search: options.search || undefined,
      type: options.type !== 'all' ? options.type : undefined,
      includeArchived: options.includeArchived,
      priorities: undefinedIfEmpty(options.priorities),
      quarters: undefinedIfEmpty(options.quarters),
      areas: undefinedIfEmpty(options.areas),
      leads: undefinedIfEmpty(options.leads),
      teams: undefinedIfEmpty(options.teams),
      dependencies: undefinedIfEmpty(options.dependencies),
    }),
    [options],
  );

  // Use tRPC to fetch projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = trpc.project.getProjects.useQuery(queryInput);

  const projects = useMemo(() => projectsData?.projects || [], [projectsData?.projects]);

  // tRPC utils for cache manipulation
  const utils = trpc.useUtils();

  // tRPC mutation for updating projects with proper optimistic updates
  const updateProjectMutation = trpc.project.patchProject.useMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.project.getProjects.cancel(queryInput);

      // Snapshot the previous value
      const previousProjects = utils.project.getProjects.getData(queryInput);

      // Optimistically update to the new value
      if (previousProjects) {
        utils.project.getProjects.setData(queryInput, {
          ...previousProjects,
          projects: previousProjects.projects.map((project) =>
            project.id === variables.id ? ({ ...project, ...variables } as Project) : project,
          ),
        });
      }

      // Return a context object with the snapshotted value
      return { previousProjects };
    },
    onError: (error, variables, context) => {
      console.error('Error updating project:', error);

      // If the mutation fails, use the context to roll back
      if (context?.previousProjects) {
        utils.project.getProjects.setData(queryInput, context.previousProjects);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.project.getProjects.invalidate(queryInput);
    },
  });

  const updateProject = useCallback(
    async (updates: UpdateProjectInput) => {
      console.log('updates', updates);
      try {
        await updateProjectMutation.mutateAsync(updates);
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Error updating project:', error);
        throw error; // Re-throw to handle in the component
      }
    },
    [updateProjectMutation],
  );

  return {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    updateProject,
    isUpdating: updateProjectMutation.isPending,
  };
}
