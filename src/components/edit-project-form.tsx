'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckIcon, XIcon, CalendarIcon, ArchiveIcon, ArchiveRestoreIcon, AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/lib/types';
import { ColorSelector } from './color-selector';
import { DEFAULT_PROJECT_COLOR_NAME } from '@/lib/project-colors';
import { ROLES_TO_DISPLAY } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrioritySelector } from './priroty-selector';
import { ProjectAreaSelector } from './project-area-selector';
import { TeamOption, TeamSelector } from './team-selector';
import { PersonSelector } from './person-selector';
import { QuarterMultiSelector } from './quarter-multi-selector';
import { ProjectTypeSelector } from './project-type-selector';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';

interface EditProjectFormProps {
  project: Project;
  onCancel: () => void;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function EditProjectForm({ project, onCancel, teams, teamsLoading }: EditProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [formData, setFormData] = useState({
    name: project.name,
    slug: project.slug || '',
    type: project.type || 'regular',
    area: project.area || '',
    priority: project.priority || 'medium',
    description: project.description || '',
    color: project.color || 'blue',
    teamIds: project.teamIds || [],
    leadId: project.leadId || '',
    quarters: project.quarters || [],
    dependencies: project.dependencies?.map((dep) => dep.team).join(', ') || '',
    cost: project.cost?.toString() || '',
    impact: project.impact?.toString() || '',
    roi: project.roi?.toString() || '',
    archived: project.archived || false,
    estimates: ROLES_TO_DISPLAY.reduce(
      (acc, role) => {
        const estimate = project.estimates?.find((est) => est.department === role);
        acc[role] = estimate?.value || 0;
        return acc;
      },
      {} as Record<string, number>,
    ),
  });

  const initialFormData = useMemo(
    () => ({
      name: project.name,
      slug: project.slug,
      description: project.description || '',
      priority: project.priority || 'medium',
      teamIds: project.teamIds || [],
      leadId: project.leadId || '',
      area: project.area || '',
      quarters: project.quarters || [],
      dependencies: project.dependencies?.map((dep) => dep.team).join(', ') || '',
      color: project.color || DEFAULT_PROJECT_COLOR_NAME,
      archived: project.archived || false,
      estimates: ROLES_TO_DISPLAY.reduce(
        (acc, role) => {
          const existingEstimate = project.estimates?.find((est) => est.department === role);
          acc[role] = existingEstimate ? existingEstimate.value : 0;
          return acc;
        },
        {} as Record<string, number>,
      ),
      roi: project.roi || '',
      cost: project.cost || '',
      impact: project.impact || '',
      type: project.type,
    }),
    [project],
  );

  // Deep comparison function for detecting changes
  const hasUnsavedChanges = useMemo(() => {
    const currentData = { ...formData };
    const originalData = { ...initialFormData };

    // Convert estimates objects to comparable format
    const currentEstimates = JSON.stringify(currentData.estimates);
    const originalEstimates = JSON.stringify(originalData.estimates);

    // Convert arrays to comparable format
    const currentTeamIds = JSON.stringify(currentData.teamIds);
    const originalTeamIds = JSON.stringify(originalData.teamIds);
    const currentQuarters = JSON.stringify(currentData.quarters);
    const originalQuarters = JSON.stringify(originalData.quarters);

    return (
      currentData.name !== originalData.name ||
      currentData.slug !== originalData.slug ||
      currentData.description !== originalData.description ||
      currentData.priority !== originalData.priority ||
      currentTeamIds !== originalTeamIds ||
      currentData.leadId !== originalData.leadId ||
      currentData.area !== originalData.area ||
      currentQuarters !== originalQuarters ||
      currentData.dependencies !== originalData.dependencies ||
      currentData.color !== originalData.color ||
      currentData.archived !== originalData.archived ||
      currentData.roi !== originalData.roi ||
      currentData.cost !== originalData.cost ||
      currentData.impact !== originalData.impact ||
      currentData.type !== originalData.type ||
      currentEstimates !== originalEstimates
    );
  }, [formData, initialFormData]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color: color }));
  };

  const handleEstimateChange = (role: string, value: string) => {
    const weeks = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      estimates: {
        ...prev.estimates,
        [role]: isNaN(weeks) ? 0 : weeks,
      },
    }));
  };

  const handleBusinessImpactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleArchive = () => {
    setFormData((prev) => ({ ...prev, archived: !prev.archived }));
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel? Your changes will be lost.',
      );
      if (!confirmed) return;
    }
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setIsSubmitting(true);

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
          ? formData.dependencies.split(',').map((dep) => ({ team: dep.trim() }))
          : [],
        // TODO: Breaks mongodb and causese maximum call stack size exceeded error
        // estimates: ROLES_TO_DISPLAY.map((role) => ({
        //   role,
        //   value: formData.estimates[role] || 0,
        // })),
      });

      router.refresh();
      onCancel();
    } catch (error) {
      // Error is already handled in the mutation onError callback
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs px-2 py-1 h-auto"
            >
              <XIcon className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleArchive}
              className="text-xs px-2 py-1 h-auto"
            >
              {formData.archived ? (
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

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-medium">
                <AlertCircleIcon className="h-3 w-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isSubmitting || !hasUnsavedChanges}
            className={cn(
              'text-xs px-2 py-1 h-auto transition-all',
              hasUnsavedChanges && 'ring-2 ring-blue-500/20 shadow-sm',
            )}
          >
            <CheckIcon className="h-3 w-3 mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-1">
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="md:text-xl text-xl font-bold w-full border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0"
            placeholder="Project Name"
            required
          />
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="text-sm w-full border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0 text-muted-foreground"
            placeholder="project-slug"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs text-muted-foreground font-medium">PROPERTIES</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            <ColorSelector selectedColorName={formData.color} onColorChange={handleColorChange} />
            <PrioritySelector
              type="inline"
              value={formData.priority}
              onSelect={(value) => handleSelectChange('priority', value as 'low' | 'medium' | 'high' | 'urgent')}
            />
            <ProjectAreaSelector
              type="inline"
              value={formData.area}
              onSelect={(value) => handleSelectChange('area', value)}
            />
            <QuarterMultiSelector
              type="inline"
              value={formData.quarters}
              onSelect={(value) => handleSelectChange('quarters', value)}
            />
            <TeamSelector
              type="inline"
              value={formData.teamIds.length > 0 ? formData.teamIds[0] : ''}
              onSelect={(value) => handleSelectChange('teamIds', value ? [value] : [])}
              teams={teams}
              loading={teamsLoading}
            />
            <ProjectTypeSelector
              type="inline"
              value={formData.type}
              onSelect={(value) => handleSelectChange('type', value)}
            />
            {/* TODO: Figure out why lead selector doesn't display proper user name */}
            <PersonSelector
              type="inline"
              value={formData.leadId}
              onSelect={(value) => handleSelectChange('leadId', value)}
              teams={teams}
              loading={teamsLoading}
              placeholder="Select lead"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description" className="text-xs text-muted-foreground font-medium">
            DESCRIPTION
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-0 border border-transparent hover:border-muted focus:border-input focus:outline-none min-h-[60px] text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
            placeholder="Add a more detailed description..."
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dependencies" className="text-xs text-muted-foreground font-medium">
            DEPENDENCIES
          </Label>
          <Textarea
            id="dependencies"
            name="dependencies"
            value={formData.dependencies}
            onChange={handleChange}
            className="w-full p-0 border border-transparent hover:border-muted focus:border-input focus:outline-none min-h-[40px] text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
            placeholder="e.g. Team A, Team B"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground font-medium">BUSINESS IMPACT ESTIMATES</Label>
          <div className="grid grid-cols-3 gap-4 rounded-md border p-4">
            <div className="space-y-1">
              <Label htmlFor="cost" className="text-xs text-muted-foreground font-medium">
                Cost (€)
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                  €
                </span>
                <Input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleBusinessImpactChange}
                  className="w-full pl-5 pr-1 border border-transparent hover:border-muted focus:border-input focus:outline-none h-auto text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="impact" className="text-xs text-muted-foreground font-medium">
                Impact (€)
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                  €
                </span>
                <Input
                  type="number"
                  id="impact"
                  name="impact"
                  value={formData.impact}
                  onChange={handleBusinessImpactChange}
                  className="w-full pl-5 pr-1 border border-transparent hover:border-muted focus:border-input focus:outline-none h-auto text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="roi" className="text-xs text-muted-foreground font-medium">
                ROI (%)
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  id="roi"
                  name="roi"
                  value={formData.roi}
                  readOnly
                  className="w-full pr-5 border border-transparent bg-muted/30 text-sm focus:outline-none h-auto shadow-none rounded-sm cursor-default opacity-70"
                  placeholder="Auto-calculated"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground font-medium">ROLE ESTIMATES (WEEKS)</Label>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] text-xs text-muted-foreground font-medium h-8 px-2">Role</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium h-8 px-2">Estimate (weeks)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROLES_TO_DISPLAY.map((role) => (
                  <TableRow key={role}>
                    <TableCell className="font-medium py-1 px-2 text-sm capitalize">{role}</TableCell>
                    <TableCell className="py-1 px-2">
                      <Input
                        type="number"
                        min="0"
                        value={formData.estimates[role]}
                        onChange={(e) => handleEstimateChange(role, e.target.value)}
                        className="w-full p-1 border border-transparent hover:border-muted focus:border-input focus:outline-none h-auto text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
                        placeholder="0"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3 opacity-70" />
            <span>Created: {project.createdAt ? format(new Date(project.createdAt), 'PP') : 'Unknown'}</span>
          </div>
        </div>
      </form>
    </>
  );
}
