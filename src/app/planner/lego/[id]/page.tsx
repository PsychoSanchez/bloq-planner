'use client';

import { LegoPlanner } from '@/components/lego-planner';
import { ProjectAllocationPanel } from '@/components/project-allocation-panel';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast, useToast } from '@/components/ui/use-toast';
import { Assignment } from '@/lib/types';
import { trpc } from '@/utils/trpc';

const useAssignments = (plannerId: string) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Use tRPC to fetch assignments
  const { data: assignmentsData, error: assignmentsError } = trpc.assignment.getAssignments.useQuery({
    plannerId: plannerId,
  });

  // tRPC mutations
  const utils = trpc.useUtils();

  const createAssignmentMutation = trpc.assignment.createAssignment.useMutation({
    onSuccess: (newAssignment) => {
      setAssignments((prev) => [...prev, newAssignment]);
      utils.assignment.getAssignments.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create assignment',
        description: error.message || 'Failed to create assignment',
        variant: 'destructive',
      });
    },
  });

  const updateAssignmentMutation = trpc.assignment.updateAssignment.useMutation({
    onSuccess: (updatedAssignment) => {
      setAssignments((prev) => prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a)));
      utils.assignment.getAssignments.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update assignment',
        description: error.message || 'Failed to update assignment',
        variant: 'destructive',
      });
    },
  });

  const deleteAssignmentMutation = trpc.assignment.deleteAssignment.useMutation({
    onSuccess: (_, variables) => {
      setAssignments((prev) => prev.filter((a) => a.id !== variables.id));
      utils.assignment.getAssignments.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete assignment',
        description: error.message || 'Failed to delete assignment',
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

  const createAssignment = useCallback(
    async (assignment: Omit<Assignment, 'id'>) => {
      try {
        await createAssignmentMutation.mutateAsync(assignment);
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Failed to create assignment:', error);
      }
    },
    [createAssignmentMutation],
  );

  const updateAssignment = useCallback(
    async (assignment: Partial<Assignment>) => {
      if (!assignment.id) {
        throw new Error('Assignment ID is required for update');
      }

      try {
        await updateAssignmentMutation.mutateAsync({
          id: assignment.id,
          assigneeId: assignment.assigneeId!,
          projectId: assignment.projectId!,
          plannerId: assignment.plannerId!,
          week: assignment.week!,
          year: assignment.year!,
          quarter: assignment.quarter,
          status: assignment.status,
        });
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Failed to update assignment:', error);
      }
    },
    [updateAssignmentMutation],
  );

  const deleteAssignment = useCallback(
    async (assignmentId: string) => {
      try {
        await deleteAssignmentMutation.mutateAsync({ id: assignmentId });
      } catch (error) {
        // Error is already handled in the mutation onError callback
        console.error('Failed to delete assignment:', error);
      }
    },
    [deleteAssignmentMutation],
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
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
};

export default function LegoPlannerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const plannerId = params.id as string;

  // Use tRPC to fetch planner data
  const {
    data: plannerData,
    isLoading,
    error: plannerError,
  } = trpc.planner.getPlannerById.useQuery({
    id: plannerId,
  });

  const { assignments, getAssignmentsForWeekAndAssignee, createAssignment, updateAssignment, deleteAssignment } =
    useAssignments(plannerId);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading planner data...</p>
        </div>
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Lego Planner ({plannerId.substring(0, 8)})</h1>
      </div>
      <LegoPlanner
        initialData={plannerData}
        getAssignmentsForWeekAndAssignee={getAssignmentsForWeekAndAssignee}
        createAssignment={createAssignment}
        updateAssignment={updateAssignment}
        deleteAssignment={deleteAssignment}
      />
      {plannerData && (
        <div className="mt-8">
          <ProjectAllocationPanel plannerData={plannerData} assignments={assignments} />
        </div>
      )}
    </div>
  );
}
