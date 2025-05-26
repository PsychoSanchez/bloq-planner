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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`/api/assignments?plannerId=${plannerId}`);
        const data = await response.json();
        setAssignments(data);
        setIsLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch assignments');
        toast({
          title: 'Failed to fetch assignments',
          description: error instanceof Error ? error.message : 'Failed to fetch assignments',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, [plannerId]);

  const createAssignment = useCallback(async (assignment: Omit<Assignment, 'id'>) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        body: JSON.stringify(assignment),
      });
      const data = await response.json();
      setAssignments((prev) => [...prev, data]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create assignment');
      toast({
        title: 'Failed to create assignment',
        description: error instanceof Error ? error.message : 'Failed to create assignment',
        variant: 'destructive',
      });
    }
  }, []);

  const updateAssignment = useCallback(async (assignment: Partial<Assignment>) => {
    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        body: JSON.stringify(assignment),
      });
      const data = await response.json();
      setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? data : a)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update assignment');
      toast({
        title: 'Failed to update assignment',
        description: error instanceof Error ? error.message : 'Failed to update assignment',
        variant: 'destructive',
      });
    }
  }, []);

  const deleteAssignment = useCallback(async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete assignment');
      toast({
        title: 'Failed to delete assignment',
        description: error instanceof Error ? error.message : 'Failed to delete assignment',
        variant: 'destructive',
      });
    }
  }, []);

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
