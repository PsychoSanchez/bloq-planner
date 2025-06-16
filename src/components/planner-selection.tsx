// Needs to be rethought and refactored

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyPlaceholder } from '@/components/ui/empty-placeholder';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash, Check, Edit } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Planner, Project, Assignee } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  CompactCard,
  CompactCardHeader,
  CompactCardTitle,
  CompactCardDescription,
  CompactCardContent,
  CompactCardFooter,
} from '@/components/ui/compact-card';
import { trpc } from '@/utils/trpc';

// Custom hook for data fetching
function usePlannerDialogData(open: boolean) {
  const { toast } = useToast();

  const teamQuery = trpc.team.getTeamMembers.useQuery(
    {},
    {
      enabled: open,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  );

  const projectsQuery = trpc.project.getProjects.useQuery(
    {},
    {
      enabled: open,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  );

  // Handle errors with toast notifications
  useEffect(() => {
    if (teamQuery.error) {
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    }
  }, [teamQuery.error, toast]);

  useEffect(() => {
    if (projectsQuery.error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    }
  }, [projectsQuery.error, toast]);

  const availableAssignees: Assignee[] = useMemo(
    () =>
      teamQuery.data?.map((member) => ({
        id: member.id,
        name: member.name,
        type: (member.type as 'person' | 'team' | 'dependency' | 'event') || 'person',
      })) || [],
    [teamQuery.data],
  );

  const availableProjects = useMemo(() => projectsQuery.data?.projects || [], [projectsQuery.data]);

  return {
    availableAssignees,
    availableProjects,
    isLoadingAssignees: teamQuery.isLoading,
    isLoadingProjects: projectsQuery.isLoading,
    hasError: !!teamQuery.error || !!projectsQuery.error,
  };
}

// Custom hook for form state management
function usePlannerForm(mode: 'create' | 'edit', planner?: Planner, yearValue?: number, quarterValue?: number) {
  const [formState, setFormState] = useState(() => ({
    name: mode === 'edit' && planner ? planner.name : `Q${quarterValue} ${yearValue} Lego Planner`,
    selectedProjects: mode === 'edit' && planner ? planner.projects : [],
    selectedAssignees: mode === 'edit' && planner ? planner.assignees : [],
    projectSearch: '',
    assigneeSearch: '',
  }));

  const updateFormState = useCallback((updates: Partial<typeof formState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    const defaultName = mode === 'create' ? `Q${quarterValue} ${yearValue} Lego Planner` : planner?.name || '';

    setFormState({
      name: defaultName,
      selectedProjects: mode === 'edit' && planner ? planner.projects : [],
      selectedAssignees: mode === 'edit' && planner ? planner.assignees : [],
      projectSearch: '',
      assigneeSearch: '',
    });
  }, [mode, planner, yearValue, quarterValue]);

  const toggleProject = useCallback((project: Project) => {
    setFormState((prev) => ({
      ...prev,
      selectedProjects: prev.selectedProjects.some((p) => p.id === project.id)
        ? prev.selectedProjects.filter((p) => p.id !== project.id)
        : [...prev.selectedProjects, project],
    }));
  }, []);

  const toggleAssignee = useCallback((assignee: Assignee) => {
    setFormState((prev) => ({
      ...prev,
      selectedAssignees: prev.selectedAssignees.some((a) => a.id === assignee.id)
        ? prev.selectedAssignees.filter((a) => a.id !== assignee.id)
        : [...prev.selectedAssignees, assignee],
    }));
  }, []);

  const clearProjects = useCallback(() => {
    updateFormState({ selectedProjects: [] });
  }, [updateFormState]);

  const clearAssignees = useCallback(() => {
    updateFormState({ selectedAssignees: [] });
  }, [updateFormState]);

  const isFormValid = useMemo(
    () => formState.name.trim() !== '' && formState.selectedAssignees.length > 0,
    [formState.name, formState.selectedAssignees.length],
  );

  return {
    formState,
    updateFormState,
    resetForm,
    toggleProject,
    toggleAssignee,
    clearProjects,
    clearAssignees,
    isFormValid,
  };
}

// Loading skeleton component
function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-2 p-2">
          <div className="h-3 w-3 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded flex-1" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

// Selection list component
interface SelectionListProps<T> {
  items: T[];
  selectedItems: T[];
  onToggle: (item: T) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  isLoading: boolean;
  emptyMessage: string;
  noResultsMessage: string;
  getItemId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}

function SelectionList<T>({
  items,
  selectedItems,
  onToggle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  isLoading,
  emptyMessage,
  noResultsMessage,
  getItemId,
  renderItem,
}: SelectionListProps<T>) {
  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(searchValue.toLowerCase()));
  }, [items, searchValue]);

  if (isLoading) {
    return (
      <div className="border rounded-md p-3">
        <LoadingSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-muted/30">
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 text-sm placeholder:text-sm"
      />

      <div className="border rounded-md max-h-[140px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground">{noResultsMessage}</div>
        ) : (
          <div className="p-1">
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some((selected) => getItemId(selected) === getItemId(item));
              return (
                <div
                  key={getItemId(item)}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors',
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted/50',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(item);
                  }}
                >
                  <div
                    className={cn(
                      'flex h-3 w-3 items-center justify-center rounded border transition-colors',
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40',
                    )}
                  >
                    {isSelected && <Check className="h-2 w-2 text-primary-foreground" />}
                  </div>
                  {renderItem(item)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface PlannerDialogProps {
  mode: 'create' | 'edit';
  planner?: Planner; // Required for edit mode
  onSubmit: (data: { name: string; projects: Project[]; assignees: Assignee[] }) => Promise<void>;
  yearValue: number;
  quarterValue: number;
  trigger?: React.ReactNode;
}

function PlannerDialog({ mode, planner, onSubmit, yearValue, quarterValue, trigger }: PlannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { availableAssignees, availableProjects, isLoadingAssignees, isLoadingProjects, hasError } =
    usePlannerDialogData(open);

  const {
    formState,
    updateFormState,
    resetForm,
    toggleProject,
    toggleAssignee,
    clearProjects,
    clearAssignees,
    isFormValid,
  } = usePlannerForm(mode, planner, yearValue, quarterValue);

  // Reset form when dialog opens in edit mode
  useEffect(() => {
    if (mode === 'edit' && planner && open) {
      resetForm();
    }
  }, [mode, open, planner, resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formState.name,
        projects: formState.selectedProjects,
        assignees: formState.selectedAssignees,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(`Failed to ${mode} planner:`, error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, onSubmit, formState, mode, resetForm]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) resetForm();
      setOpen(newOpen);
    },
    [resetForm],
  );

  const defaultTrigger = useMemo(
    () =>
      mode === 'create' ? (
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Planner
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      ),
    [mode],
  );

  const renderProjectItem = useCallback(
    (project: Project) => (
      <>
        <div className="flex-1 min-w-0 flex items-center gap-1">
          {project.icon && <span className="text-xs">{project.icon}</span>}
          <p className="text-xs font-medium truncate">{project.name}</p>
        </div>
        {project.type && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            {project.type}
          </Badge>
        )}
      </>
    ),
    [],
  );

  const renderAssigneeItem = useCallback(
    (assignee: Assignee) => (
      <>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">{assignee.name}</p>
        </div>
        <Badge variant={assignee.type === 'team' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
          {assignee.type === 'team' ? 'Team' : 'Person'}
        </Badge>
      </>
    ),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3">
          <DialogTitle>{mode === 'create' ? 'Create New Lego Planner' : 'Edit Lego Planner'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? `Configure your planner for Q${quarterValue} ${yearValue}`
              : `Update your planner configuration`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Planner Name */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm font-medium">
              Planner Name
            </Label>
            <Input
              id="name"
              value={formState.name}
              onChange={(e) => updateFormState({ name: e.target.value })}
              placeholder="Enter planner name..."
            />
          </div>

          {/* Projects Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Additional Projects ({formState.selectedProjects.length})</Label>
              {formState.selectedProjects.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearProjects}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Default projects (Vacation, Duty, Sick Leave, Team Event) are always available
            </div>

            <SelectionList
              items={availableProjects}
              selectedItems={formState.selectedProjects}
              onToggle={toggleProject}
              searchValue={formState.projectSearch}
              onSearchChange={(value) => updateFormState({ projectSearch: value })}
              searchPlaceholder="Search projects..."
              isLoading={isLoadingProjects}
              emptyMessage="No projects available"
              noResultsMessage="No projects match your search"
              getItemId={(project) => project.id}
              renderItem={renderProjectItem}
            />
          </div>

          {/* Team Members Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Team Members ({formState.selectedAssignees.length})</Label>
              {formState.selectedAssignees.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAssignees}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>

            <SelectionList
              items={availableAssignees}
              selectedItems={formState.selectedAssignees}
              onToggle={toggleAssignee}
              searchValue={formState.assigneeSearch}
              onSearchChange={(value) => updateFormState({ assigneeSearch: value })}
              searchPlaceholder="Search team members..."
              isLoading={isLoadingAssignees}
              emptyMessage="No team members available"
              noResultsMessage="No team members match your search"
              getItemId={(assignee) => assignee.id}
              renderItem={renderAssigneeItem}
            />
          </div>

          {/* Compact Selection Summary */}
          {(formState.selectedProjects.length > 0 || formState.selectedAssignees.length > 0) && (
            <div className="bg-muted/30 rounded-md p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Selected:</span>
                <span className="font-medium">
                  {formState.selectedProjects.length} projects, {formState.selectedAssignees.length} members
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">{!isFormValid && <span>Select team members</span>}</div>
            <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting || hasError} className="h-8 px-4">
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Planner'
              ) : (
                'Update Planner'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Legacy component for backward compatibility
function CreatePlannerDialog({
  onCreatePlanner,
  yearValue,
  quarterValue,
}: {
  onCreatePlanner: (data: { name: string; projects: Project[]; assignees: Assignee[] }) => Promise<void>;
  yearValue: number;
  quarterValue: number;
}) {
  return <PlannerDialog mode="create" onSubmit={onCreatePlanner} yearValue={yearValue} quarterValue={quarterValue} />;
}

export function PlannerSelection() {
  const defaultYear = new Date().getFullYear();
  const defaultQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const [yearValue] = useQueryState('year', parseAsInteger.withDefault(defaultYear));
  const [quarterValue] = useQueryState('quarter', parseAsInteger.withDefault(defaultQuarter));

  const { toast } = useToast();
  const router = useRouter();

  // Use tRPC to fetch planners
  const {
    data: plannersData,
    isLoading,
    error: plannersError,
  } = trpc.planner.getPlanners.useQuery({
    year: yearValue,
    quarter: quarterValue,
  });

  const planners = plannersData?.planners || [];

  // tRPC mutations
  const utils = trpc.useUtils();

  const createPlannerMutation = trpc.planner.createPlanner.useMutation({
    onSuccess: () => {
      utils.planner.getPlanners.invalidate();
      toast({
        title: 'Success',
        description: 'New planner created successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to create planner:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new planner',
        variant: 'destructive',
      });
    },
  });

  const updatePlannerMutation = trpc.planner.updatePlanner.useMutation({
    onSuccess: () => {
      utils.planner.getPlanners.invalidate();
      toast({
        title: 'Success',
        description: 'Planner updated successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to update planner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update planner',
        variant: 'destructive',
      });
    },
  });

  const deletePlannerMutation = trpc.planner.deletePlanner.useMutation({
    onSuccess: () => {
      utils.planner.getPlanners.invalidate();
      toast({
        title: 'Success',
        description: 'Planner deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to delete planner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete planner',
        variant: 'destructive',
      });
    },
  });

  // Show error toast if planners fetch fails
  useEffect(() => {
    if (plannersError) {
      console.error('Failed to load planners:', plannersError);
      toast({
        title: 'Error',
        description: 'Failed to load planners',
        variant: 'destructive',
      });
    }
  }, [plannersError, toast]);

  const handleCreatePlanner = async (data: { name: string; projects: Project[]; assignees: Assignee[] }) => {
    try {
      // Extract just the IDs for the API
      await createPlannerMutation.mutateAsync({
        name: data.name,
        projects: data.projects.map((project) => project.id),
        assignees: data.assignees.map((assignee) => assignee.id),
      });
    } catch (error) {
      // Error is already handled in the mutation onError callback
      throw error; // Re-throw to handle in the dialog
    }
  };

  const handleUpdatePlanner = async (
    plannerId: string,
    data: { name: string; projects: Project[]; assignees: Assignee[] },
  ) => {
    try {
      // Extract just the IDs for the API
      await updatePlannerMutation.mutateAsync({
        id: plannerId,
        name: data.name,
        projects: data.projects.map((project) => project.id),
        assignees: data.assignees.map((assignee) => assignee.id),
      });
    } catch (error) {
      // Error is already handled in the mutation onError callback
      throw error; // Re-throw to handle in the dialog
    }
  };

  const handleOpenPlanner = (plannerId: string) => {
    router.push(`/planner/lego/${plannerId}`);
  };

  const handleDeletePlanner = async (plannerId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await deletePlannerMutation.mutateAsync({ id: plannerId });
    } catch (error) {
      // Error is already handled in the mutation onError callback
      console.error('Failed to delete planner:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-row justify-center items-center gap-2">
          <h1 className="text-xl font-bold">Lego Planners</h1>
          <p className="text-muted-foreground">
            Q{quarterValue} {yearValue} - {planners.length} planner{planners.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreatePlannerDialog onCreatePlanner={handleCreatePlanner} yearValue={yearValue} quarterValue={quarterValue} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : planners.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="file" />
          <EmptyPlaceholder.Title>No planners found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Create your first planner for Q{quarterValue} {yearValue}.
          </EmptyPlaceholder.Description>
          <CreatePlannerDialog
            onCreatePlanner={handleCreatePlanner}
            yearValue={yearValue}
            quarterValue={quarterValue}
          />
        </EmptyPlaceholder>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planners.map((planner) => (
            <div key={planner.id} className="relative">
              <CompactCard
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenPlanner(planner.id)}
              >
                <CompactCardHeader>
                  <CompactCardTitle>{planner.name || `Lego Planner ${planner.id.substring(0, 8)}`}</CompactCardTitle>
                  <CompactCardDescription>
                    {planner.projects.length} projects, {planner.assignees.length} assignees
                  </CompactCardDescription>
                </CompactCardHeader>
                <CompactCardContent>
                  <div className="text-sm text-muted-foreground">
                    <div>Projects: {planner.projects.length}</div>
                    <div>Assignees: {planner.assignees.length}</div>
                  </div>
                </CompactCardContent>
                <CompactCardFooter className="flex justify-between">
                  <div className="text-xs text-muted-foreground">
                    Q{quarterValue} {yearValue}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeletePlanner(planner.id, e)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CompactCardFooter>
              </CompactCard>

              {/* Dialog outside the CompactCard to prevent click conflicts */}
              <PlannerDialog
                mode="edit"
                planner={planner}
                onSubmit={(data) => handleUpdatePlanner(planner.id, data)}
                yearValue={yearValue}
                quarterValue={quarterValue}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-10 h-8 w-8 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
