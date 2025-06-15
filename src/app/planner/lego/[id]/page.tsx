'use client';

import { LegoPlanner } from '@/app/planner/lego/[id]/_components/lego-planner';
import { ProjectAllocationPanel } from '@/app/planner/lego/[id]/_components/project-allocation-panel';
import { ProjectDetailsSheet } from '@/components/project-details-sheet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast, useToast } from '@/components/ui/use-toast';
import { Assignment, Project, Role } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';
import { trpc } from '@/utils/trpc';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useAssignmentSubscription } from '@/hooks/use-assignment-subscription';
import { LiveStatusBadge } from '@/components/live-status-badge';

const useAssignments = (plannerId: string) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Use tRPC to fetch assignments
  const { data: assignmentsData, error: assignmentsError } = trpc.assignment.getAssignments.useQuery({
    plannerId: plannerId,
  });

  // Bulk mutations
  const bulkUpsertAssignmentsMutation = trpc.assignment.bulkUpsertAssignments.useMutation({
    onSuccess: (result) => {
      // Update local state with the upserted assignments
      setAssignments((prev) => {
        const updatedAssignments = [...prev];

        // Remove old assignments that were updated
        result.updated.forEach((updated) => {
          const index = updatedAssignments.findIndex((a) => a.id === updated.id);
          if (index !== -1) {
            updatedAssignments[index] = updated;
          }
        });

        // Add new assignments that were created
        result.created.forEach((created) => {
          // Remove any temporary assignments first
          const tempIndex = updatedAssignments.findIndex(
            (a) =>
              a.id.startsWith('temp-') &&
              a.assigneeId === created.assigneeId &&
              a.week === created.week &&
              a.year === created.year,
          );
          if (tempIndex !== -1) {
            updatedAssignments.splice(tempIndex, 1);
          }
          updatedAssignments.push(created);
        });

        return updatedAssignments;
      });
      // utils.assignment.getAssignments.invalidate();
    },
    onError: (error) => {
      // Revert optimistic updates by removing temporary assignments
      setAssignments((prev) => prev.filter((a) => !a.id.startsWith('temp-bulk-')));
      toast({
        title: 'Failed to assign projects',
        description: error.message || 'Failed to assign projects',
        variant: 'destructive',
      });
    },
  });

  const bulkDeleteAssignmentsMutation = trpc.assignment.bulkDeleteAssignments.useMutation({
    onSuccess: () => {
      // The optimistic update is already in place, just invalidate cache
      // utils.assignment.getAssignments.invalidate();
    },
    onError: (error, variables) => {
      // Revert the optimistic update by restoring deleted assignments
      if (assignmentsData) {
        const deletedAssignments = assignmentsData.filter((a) => variables.ids.includes(a.id));
        setAssignments((prev) => [...prev, ...deletedAssignments]);
      }
      toast({
        title: 'Failed to delete assignments',
        description: error.message || 'Failed to delete assignments',
        variant: 'destructive',
      });
    },
  });

  // Update local state when tRPC data changes
  useEffect(() => {
    if (assignmentsData) {
      setAssignments(assignmentsData);
    }
  }, [assignmentsData]);

  // Show error toast if assignments fetch fails
  useEffect(() => {
    if (assignmentsError) {
      toast({
        title: 'Failed to fetch assignments',
        description: assignmentsError.message || 'Failed to fetch assignments',
        variant: 'destructive',
      });
    }
  }, [assignmentsError]);

  // Bulk operations
  const bulkUpsertAssignments = useCallback(
    async (
      assignmentData: Array<{
        assigneeId: string;
        week: number;
        projectId: string;
        plannerId: string;
        year: number;
        quarter: number;
        status?: string;
      }>,
    ) => {
      // Generate temporary assignments for optimistic update
      const tempAssignments: Assignment[] = assignmentData.map((data, index) => ({
        id: `temp-bulk-${index}-${Date.now()}`,
        ...data,
        status: data.status || 'planned',
      }));

      // Optimistic update: add temporary assignments
      setAssignments((prev) => [...prev, ...tempAssignments]);

      try {
        await bulkUpsertAssignmentsMutation.mutateAsync({
          assignments: assignmentData.map((data) => ({
            assigneeId: data.assigneeId,
            projectId: data.projectId,
            plannerId: data.plannerId,
            week: data.week,
            year: data.year,
            quarter: data.quarter,
            status: data.status,
          })),
        });
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Failed to bulk upsert assignments:', error);
      }
    },
    [bulkUpsertAssignmentsMutation],
  );

  const bulkDeleteAssignments = useCallback(
    async (assignmentIds: string[]) => {
      // Optimistic update: remove assignments immediately
      setAssignments((prev) => prev.filter((a) => !assignmentIds.includes(a.id)));

      try {
        await bulkDeleteAssignmentsMutation.mutateAsync({ ids: assignmentIds });
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Failed to bulk delete assignments:', error);
      }
    },
    [bulkDeleteAssignmentsMutation],
  );

  const assignmentsByWeekAndAssignee = useMemo(() => {
    const result = new Map<number, Map<string, Assignment>>();
    for (const assignment of assignments) {
      if (!result.has(assignment.week)) {
        result.set(assignment.week, new Map<string, Assignment>());
      }
      result.get(assignment.week)?.set(assignment.assigneeId, assignment);
    }
    return result;
  }, [assignments]);

  const getAssignmentsForWeekAndAssignee = useCallback(
    (week: number, assigneeId: string) => {
      return assignmentsByWeekAndAssignee.get(week)?.get(assigneeId);
    },
    [assignmentsByWeekAndAssignee],
  );

  return {
    assignments,
    getAssignmentsForWeekAndAssignee,
    bulkUpsertAssignments,
    bulkDeleteAssignments,
  };
};

export default function LegoPlannerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const plannerId = params.id as string;

  // Get current year and quarter from URL state (same as LegoPlanner)
  const [currentYear] = useQueryState('year', parseAsInteger.withDefault(2025));
  const [currentQuarter] = useQueryState('quarter', parseAsInteger.withDefault(2));

  // Use tRPC to fetch planner data
  const {
    data: plannerData,
    isLoading,
    error: plannerError,
  } = trpc.planner.getPlannerById.useQuery({
    id: plannerId,
  });

  // Use tRPC to fetch team members for project details sheet
  const { data: teamMembers, isLoading: teamsLoading } = trpc.team.getTeamMembers.useQuery({});

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

  // Project details sheet state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailsSheetOpen, setIsProjectDetailsSheetOpen] = useState(false);

  // tRPC mutation for updating project estimates
  const utils = trpc.useUtils();
  const updateProjectMutation = trpc.project.patchProject.useMutation({
    onSuccess: (updatedProject) => {
      // Invalidate planner data to refresh the allocation panel
      utils.planner.getPlannerById.invalidate({ id: plannerId });

      toast({
        title: 'Estimate updated',
        description: `Updated estimate for "${updatedProject.name}"`,
      });
    },
    onError: (error) => {
      console.error('Error updating project estimate:', error);
      toast({
        title: 'Failed to update estimate',
        description: error.message || 'There was an error updating the estimate. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const { assignments, getAssignmentsForWeekAndAssignee, bulkUpsertAssignments, bulkDeleteAssignments } =
    useAssignments(plannerId);

  // Enable real-time assignment updates via SSE
  const { lastAction, isConnected, toggleConnection } = useAssignmentSubscription({
    plannerId,
    enabled: !!plannerId, // Only enable if we have a planner ID
    // Removed toast notifications - using live badge instead
  });

  // Show error toast and redirect if planner fetch fails
  useEffect(() => {
    if (plannerError) {
      console.error('Failed to load planner:', plannerError);
      toast({
        title: 'Error',
        description: 'Failed to load planner. It may have been deleted.',
        variant: 'destructive',
      });
      // Redirect back to planner selection after a delay
      setTimeout(() => router.push('/planner/lego'), 2000);
    }
  }, [plannerError, router, toast]);

  const handleBackClick = () => {
    router.push('/planner/lego');
  };

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailsSheetOpen(true);
  }, []);

  const handleProjectDetailsClose = useCallback(() => {
    setIsProjectDetailsSheetOpen(false);
    setSelectedProject(null);
  }, []);

  const handleProjectUpdate = useCallback(
    async (projectId: string, updates: Partial<Project>) => {
      try {
        const updatedProject = await updateProjectMutation.mutateAsync({
          id: projectId,
          ...updates,
        });

        // Update the selected project if it's the one being updated
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }

        return updatedProject;
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },
    [updateProjectMutation, selectedProject],
  );

  const handleEstimateUpdate = useCallback(
    async (projectId: string, role: Role, value: number) => {
      if (!plannerData) return;

      // Find the project to get current estimates
      const project = plannerData.projects.find((p) => p.id === projectId);
      if (!project) return;

      // Update the estimates array
      const currentEstimates = project.estimates || [];
      const updatedEstimates = currentEstimates.filter((est) => est.department !== role);

      // Only add the estimate if value > 0
      if (value > 0) {
        updatedEstimates.push({
          department: role,
          value: value,
        });
      }

      try {
        await updateProjectMutation.mutateAsync({
          id: projectId,
          estimates: updatedEstimates,
        });
      } catch (error) {
        console.error('Error updating project estimate:', error);
        // Error is handled in the mutation's onError callback
      }
    },
    [updateProjectMutation, plannerData],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!plannerData) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Planner not found</p>
          <Button onClick={handleBackClick}>Return to Planner Selection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {plannerData?.name || `Lego Planner (${plannerId.substring(0, 8)})`}
          </h1>
        </div>

        {/* Live Status Badge */}
        <LiveStatusBadge isConnected={isConnected} lastAction={lastAction} onToggleConnection={toggleConnection} />
      </div>
      <LegoPlanner
        initialData={plannerData}
        getAssignmentsForWeekAndAssignee={getAssignmentsForWeekAndAssignee}
        onBulkUpsertAssignments={bulkUpsertAssignments}
        onBulkDeleteAssignments={bulkDeleteAssignments}
        onProjectClick={handleProjectClick}
      />
      {plannerData && (
        <div className="mt-8">
          <ProjectAllocationPanel
            plannerData={plannerData}
            assignments={assignments}
            currentYear={currentYear}
            currentQuarter={currentQuarter}
            onUpdateEstimate={handleEstimateUpdate}
          />
        </div>
      )}

      <ProjectDetailsSheet
        project={selectedProject}
        isOpen={isProjectDetailsSheetOpen}
        onClose={handleProjectDetailsClose}
        onUpdateProject={handleProjectUpdate}
        teams={teams}
        teamsLoading={teamsLoading}
      />
    </div>
  );
}
