'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyPlaceholder } from '@/components/ui/empty-placeholder';
import { useToast } from '@/components/ui/use-toast';
import { createPlanner, deletePlanner, getPlanners } from '@/lib/planner-api';
import { PlusCircle, Trash, Check } from 'lucide-react';
import { useQueryState } from 'nuqs';
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

// Custom type for planner creation that accepts string IDs
interface PlannerCreateData {
  name: string;
  projects: string[];
  assignees: string[];
}

interface CreatePlannerDialogProps {
  onCreatePlanner: (data: { name: string; projects: Project[]; assignees: Assignee[] }) => Promise<void>;
  yearValue: number;
  quarterValue: number;
}

function CreatePlannerDialog({ onCreatePlanner, yearValue, quarterValue }: CreatePlannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`Q${quarterValue} ${yearValue} Lego Planner`);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<Assignee[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(false);
  const { toast } = useToast();

  // Fetch projects and team members from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setAvailableProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingProjects(false);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        setIsLoadingAssignees(true);
        const response = await fetch('/api/team-members');
        if (!response.ok) throw new Error('Failed to fetch team members');
        const data = await response.json();

        // Convert team members to assignees format
        const assignees: Assignee[] = data.map(
          (member: { id: string; name: string; type?: 'person' | 'team' | 'dependency' | 'event' }) => ({
            id: member.id,
            name: member.name,
            type: member.type || 'person',
          }),
        );

        setAvailableAssignees(assignees);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team members',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAssignees(false);
      }
    };

    if (open) {
      fetchProjects();
      fetchTeamMembers();
    }
  }, [open, toast]);

  const toggleProject = (project: Project) => {
    setSelectedProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      if (exists) {
        return prev.filter((p) => p.id !== project.id);
      } else {
        return [...prev, project];
      }
    });
  };

  const toggleAssignee = (assignee: Assignee) => {
    setSelectedAssignees((prev) => {
      const exists = prev.some((a) => a.id === assignee.id);
      if (exists) {
        return prev.filter((a) => a.id !== assignee.id);
      } else {
        return [...prev, assignee];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onCreatePlanner({
        name,
        projects: selectedProjects,
        assignees: selectedAssignees,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create planner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName(`Q${quarterValue} ${yearValue} Lego Planner`);
    setSelectedProjects([]);
    setSelectedAssignees([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1">
          <PlusCircle className="h-4 w-4" />
          New Planner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Lego Planner</DialogTitle>
          <DialogDescription>
            Configure your planner for Q{quarterValue} {yearValue}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Projects</Label>
            <div className="col-span-3 space-y-2">
              {isLoadingProjects ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="text-center p-4 border rounded-md text-muted-foreground">No projects available</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
                  {availableProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                      onClick={() => toggleProject(project)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-sm border',
                          selectedProjects.some((p) => p.id === project.id)
                            ? 'bg-primary border-primary'
                            : 'border-primary',
                        )}
                      >
                        {selectedProjects.some((p) => p.id === project.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{project.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedProjects.length > 0 && (
                <div className="border rounded-md p-2 bg-muted">
                  <div className="text-sm font-medium mb-1">Selected Projects:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedProjects.map((project) => (
                      <Badge key={project.id} variant="secondary" className="mr-1 mb-1 cursor-pointer">
                        {project.name}
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProject(project);
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Team Members</Label>
            <div className="col-span-3 space-y-2">
              {isLoadingAssignees ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : availableAssignees.length === 0 ? (
                <div className="text-center p-4 border rounded-md text-muted-foreground">No team members available</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
                  {availableAssignees.map((assignee) => (
                    <div
                      key={assignee.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                      onClick={() => toggleAssignee(assignee)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-sm border',
                          selectedAssignees.some((a) => a.id === assignee.id)
                            ? 'bg-primary border-primary'
                            : 'border-primary',
                        )}
                      >
                        {selectedAssignees.some((a) => a.id === assignee.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="flex-1">{assignee.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {assignee.type === 'team' ? 'Team' : 'Person'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedAssignees.length > 0 && (
                <div className="border rounded-md p-2 bg-muted">
                  <div className="text-sm font-medium mb-1">Selected Team Members:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedAssignees.map((assignee) => (
                      <Badge key={assignee.id} variant="secondary" className="mr-1 mb-1 cursor-pointer">
                        {assignee.name}
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAssignee(assignee);
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isSubmitting || name.trim() === '' || selectedProjects.length === 0 || selectedAssignees.length === 0
            }
          >
            {isSubmitting ? 'Creating...' : 'Create Planner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlannerSelection() {
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year] = useQueryState('year', { defaultValue: '2024' });
  const [quarter] = useQueryState('quarter', { defaultValue: '2' });

  const { toast } = useToast();
  const router = useRouter();

  const yearValue = parseInt(year || '2024');
  const quarterValue = parseInt(quarter || '2');

  // Load planners for the selected quarter/year
  useEffect(() => {
    const loadPlanners = async () => {
      try {
        setIsLoading(true);
        const response = await getPlanners(yearValue, quarterValue);
        setPlanners(response.planners);
      } catch (error) {
        console.error('Failed to load planners:', error);
        toast({
          title: 'Error',
          description: 'Failed to load planners',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanners();
  }, [yearValue, quarterValue, toast]);

  const handleCreatePlanner = async (data: { name: string; projects: Project[]; assignees: Assignee[] }) => {
    try {
      // Extract just the IDs for the API
      const plannerData: PlannerCreateData = {
        name: data.name,
        projects: data.projects.map((project) => project.id),
        assignees: data.assignees.map((assignee) => assignee.id),
      };

      // Create the planner with the IDs only
      const response = await createPlanner(yearValue, quarterValue, plannerData);

      if (response.success && response.plannerId) {
        // Reload the planners list
        const updatedPlanners = await getPlanners(yearValue, quarterValue);
        setPlanners(updatedPlanners.planners);

        toast({
          title: 'Success',
          description: 'New planner created successfully',
        });
      }
    } catch (error) {
      console.error('Failed to create planner:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new planner',
        variant: 'destructive',
      });
      throw error; // Re-throw to handle in the dialog
    }
  };

  const handleOpenPlanner = (plannerId: string) => {
    router.push(`/planner/lego/${plannerId}`);
  };

  const handleDeletePlanner = async (plannerId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await deletePlanner(plannerId);

      // Reload the planners list
      const updatedPlanners = await getPlanners(yearValue, quarterValue);
      setPlanners(updatedPlanners.planners);

      toast({
        title: 'Success',
        description: 'Planner deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete planner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete planner',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lego Planners</h1>
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
            <Card
              key={planner.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenPlanner(planner.id)}
            >
              <CardHeader>
                <CardTitle>{planner.name || `Lego Planner ${planner.id.substring(0, 8)}`}</CardTitle>
                <CardDescription>
                  {planner.projects.length} projects, {planner.assignees.length} assignees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div>Projects: {planner.projects.length}</div>
                  <div>Assignees: {planner.assignees.length}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Q{quarterValue} {yearValue}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => handleDeletePlanner(planner.id, e)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
