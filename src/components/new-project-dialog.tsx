'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProjectAreaSelector } from './project-area-selector';
import { PrioritySelector } from './priroty-selector';
import { ProjectTypeSelector } from './project-type-selector';
import { ColorSelector } from './color-selector';
import { TeamSelector, TeamOption } from './team-selector';
import { QuarterSelector } from './quarter-selector';
import { Project } from '@/lib/types';
import { DEFAULT_PROJECT_COLOR_NAME } from '@/lib/project-colors';
import { ROLES_TO_DISPLAY } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function NewProjectDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        department: member.department || '', // Ensure department is always a string
        type: member.type as 'person' | 'team' | 'dependency' | 'event',
      })) || [];

  // Show error toast if team members fetch fails
  useEffect(() => {
    if (teamMembersError) {
      console.error('Error fetching teams:', teamMembersError);
    }
  }, [teamMembersError]);

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    type: Project['type'];
    area: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    color: string;
    teamId: string;
    leadId: string;
    quarter: string;
    dependencies: string;
    cost: string;
    impact: string;
    roi: string;
    estimates: Record<string, number>;
  }>({
    name: '',
    slug: '',
    type: 'regular',
    area: '',
    priority: 'medium',
    description: '',
    color: DEFAULT_PROJECT_COLOR_NAME,
    teamId: '',
    leadId: '',
    quarter: '',
    dependencies: '',
    cost: '',
    impact: '',
    roi: '',
    estimates: ROLES_TO_DISPLAY.reduce(
      (acc, role) => {
        acc[role] = 0;
        return acc;
      },
      {} as Record<string, number>,
    ),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleColorChange = (color: string) => {
    setFormData({ ...formData, color });
  };

  const handleEstimateChange = (role: string, value: string) => {
    const weeks = parseInt(value, 10);
    setFormData({
      ...formData,
      estimates: {
        ...formData.estimates,
        [role]: isNaN(weeks) ? 0 : weeks,
      },
    });
  };

  const handleBusinessImpactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Calculate ROI when cost or impact changes
      if (name === 'cost' || name === 'impact') {
        const cost = name === 'cost' ? numValue : parseFloat(prev.cost) || 0;
        const impact = name === 'impact' ? numValue : parseFloat(prev.impact) || 0;

        // ROI = ((Impact - Cost) / Cost) * 100, but only if cost > 0
        if (cost > 0) {
          const roi = ((impact - cost) / cost) * 100;
          newData.roi = roi.toFixed(2);
        } else {
          newData.roi = '';
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await createProjectMutation.mutateAsync({
        ...formData,
        dependencies: formData.dependencies
          ? formData.dependencies.split(',').map((dep) => ({ team: dep.trim() }))
          : [],
      });

      setOpen(false);
      // Reset form
      setFormData({
        name: '',
        slug: '',
        type: 'regular',
        area: '',
        priority: 'medium',
        description: '',
        color: DEFAULT_PROJECT_COLOR_NAME,
        teamId: '',
        leadId: '',
        quarter: '',
        dependencies: '',
        cost: '',
        impact: '',
        roi: '',
        estimates: ROLES_TO_DISPLAY.reduce(
          (acc, role) => {
            acc[role] = 0;
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new project to your planner.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Basic Information</h3>

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Project name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="project-slug"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a project description..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Project Properties */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Project Properties</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <ProjectTypeSelector value={formData.type} onSelect={(value) => handleSelectChange('type', value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <PrioritySelector
                    value={formData.priority}
                    onSelect={(value) => handleSelectChange('priority', value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="area">Area</Label>
                  <ProjectAreaSelector value={formData.area} onSelect={(value) => handleSelectChange('area', value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quarter">Quarter</Label>
                  <QuarterSelector
                    value={formData.quarter}
                    onSelect={(value) => handleSelectChange('quarter', value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <ColorSelector selectedColorName={formData.color} onColorChange={handleColorChange} />
                    <span className="text-sm text-muted-foreground">Project color</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="team">Team</Label>
                  <TeamSelector
                    value={formData.teamId}
                    onSelect={(value) => handleSelectChange('teamId', value)}
                    teams={teams}
                    loading={teamsLoading}
                    placeholder="Select team"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="leadId">Project Lead</Label>
                <Input
                  id="leadId"
                  name="leadId"
                  value={formData.leadId}
                  onChange={handleChange}
                  placeholder="Assign project lead"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dependencies">Dependencies</Label>
                <Textarea
                  id="dependencies"
                  name="dependencies"
                  value={formData.dependencies}
                  onChange={handleChange}
                  placeholder="e.g. Team A, Team B"
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Business Impact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Business Impact Estimates</h3>

              <div className="grid grid-cols-3 gap-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (€)</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      €
                    </span>
                    <Input
                      type="number"
                      id="cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleBusinessImpactChange}
                      className="pl-6"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact">Impact (€)</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      €
                    </span>
                    <Input
                      type="number"
                      id="impact"
                      name="impact"
                      value={formData.impact}
                      onChange={handleBusinessImpactChange}
                      className="pl-6"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (%)</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      id="roi"
                      name="roi"
                      value={formData.roi}
                      readOnly
                      className="pr-6 bg-muted/30 cursor-default"
                      placeholder="Auto-calculated"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Estimates */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Role Estimates (Weeks)</h3>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Role</TableHead>
                      <TableHead>Estimate (weeks)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ROLES_TO_DISPLAY.map((role) => (
                      <TableRow key={role}>
                        <TableCell className="font-medium capitalize">{role}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={formData.estimates[role]}
                            onChange={(e) => handleEstimateChange(role, e.target.value)}
                            placeholder="0"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
