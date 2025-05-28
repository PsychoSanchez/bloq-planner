'use client';

import { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import { CheckIcon, ArrowLeftIcon, CalendarIcon, ArchiveIcon, ArchiveRestoreIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/lib/types';
import { ColorSelector } from '@/components/color-selector';
import { DEFAULT_PROJECT_COLOR_NAME } from '@/lib/project-colors';
import { ROLES_TO_DISPLAY } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrioritySelector } from '@/components/priroty-selector';
import { ProjectAreaSelector } from '@/components/project-area-selector';
import { TeamMultiSelector, TeamOption } from '@/components/team-multi-selector';
import { DependenciesMultiSelector } from '@/components/dependencies-multi-selector';
import { PersonSelector } from '@/components/person-selector';
import { QuarterMultiSelector } from '@/components/quarter-multi-selector';
import { ProjectTypeSelector } from '@/components/project-type-selector';
import { cn } from '@/lib/utils';

export interface ProjectFormData {
  name: string;
  slug: string;
  type: Project['type'];
  area: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  color: string;
  teamIds: string[];
  leadId: string;
  quarters: string[];
  dependencies: string[];
  cost: string;
  impact: string;
  roi: string;
  archived: boolean;
  estimates: Record<string, number>;
}

export interface ProjectFormProps {
  // Data
  initialData?: Partial<Project>;
  teams: TeamOption[];
  teamsLoading: boolean;

  // Behavior
  mode: 'create' | 'edit';
  isSubmitting?: boolean;

  // Callbacks
  onSubmit: (data: ProjectFormData) => Promise<void> | void;
  onCancel?: () => void;

  // UI customization
  showBackButton?: boolean;
  showArchiveButton?: boolean;
  showCreatedDate?: boolean;
  showUnsavedChanges?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  className?: string;
}

// Function to create form data from project
const createFormDataFromProject = (projectData?: Partial<Project>): ProjectFormData => ({
  name: projectData?.name || '',
  slug: projectData?.slug || '',
  type: projectData?.type || 'regular',
  area: projectData?.area || '',
  priority: projectData?.priority || 'medium',
  description: projectData?.description || '',
  color: projectData?.color || DEFAULT_PROJECT_COLOR_NAME,
  teamIds: projectData?.teamIds || [],
  leadId: projectData?.leadId || '',
  quarters: projectData?.quarters || [],
  dependencies: projectData?.dependencies?.map((dep) => dep.team) || [],
  cost: projectData?.cost?.toString() || '',
  impact: projectData?.impact?.toString() || '',
  roi: projectData?.roi?.toString() || '',
  archived: projectData?.archived || false,
  estimates: ROLES_TO_DISPLAY.reduce(
    (acc, role) => {
      const estimate = projectData?.estimates?.find((est) => est.department === role);
      acc[role] = estimate?.value || 0;
      return acc;
    },
    {} as Record<string, number>,
  ),
});

export const ProjectForm = forwardRef<HTMLFormElement, ProjectFormProps>(function ProjectForm(
  {
    initialData,
    teams,
    teamsLoading,
    mode,
    isSubmitting = false,
    onSubmit,
    onCancel,
    showBackButton = false,
    showArchiveButton = false,
    showCreatedDate = false,
    showUnsavedChanges = true,
    showSubmitButton = true,
    submitButtonText,
    className,
  },
  ref,
) {
  // Create initial form data
  const initialFormData = useMemo(() => createFormDataFromProject(initialData), [initialData]);
  const [formData, setFormData] = useState(initialFormData);

  // Use ref to track the baseline for comparison (gets updated after saves)
  const baselineFormData = useRef(initialFormData);

  // Update baseline when initialData changes
  useEffect(() => {
    const newFormData = createFormDataFromProject(initialData);
    setFormData(newFormData);
    baselineFormData.current = newFormData;
  }, [initialData]);

  // Deep comparison function for detecting changes
  const hasUnsavedChanges = useMemo(() => {
    if (!showUnsavedChanges || mode === 'create') return false;

    const currentData = { ...formData };
    const originalData = { ...baselineFormData.current };

    // Convert estimates objects to comparable format
    const currentEstimates = JSON.stringify(currentData.estimates);
    const originalEstimates = JSON.stringify(originalData.estimates);

    // Convert arrays to comparable format
    const currentTeamIds = JSON.stringify(currentData.teamIds);
    const originalTeamIds = JSON.stringify(originalData.teamIds);
    const currentQuarters = JSON.stringify(currentData.quarters);
    const originalQuarters = JSON.stringify(originalData.quarters);
    const currentDependencies = JSON.stringify(currentData.dependencies);
    const originalDependencies = JSON.stringify(originalData.dependencies);

    return (
      currentData.name !== originalData.name ||
      currentData.slug !== originalData.slug ||
      currentData.description !== originalData.description ||
      currentData.priority !== originalData.priority ||
      currentTeamIds !== originalTeamIds ||
      currentData.leadId !== originalData.leadId ||
      currentData.area !== originalData.area ||
      currentQuarters !== originalQuarters ||
      currentDependencies !== originalDependencies ||
      currentData.color !== originalData.color ||
      currentData.archived !== originalData.archived ||
      currentData.roi !== originalData.roi ||
      currentData.cost !== originalData.cost ||
      currentData.impact !== originalData.impact ||
      currentData.type !== originalData.type ||
      currentEstimates !== originalEstimates
    );
  }, [formData, showUnsavedChanges, mode]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    if (!showUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, showUnsavedChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'slug') {
      // Auto-format slug: uppercase, no spaces, only English letters/numbers/hyphens, max 16 chars
      const formattedSlug = value
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '') // Only allow uppercase letters, numbers, and hyphens
        .slice(0, 16); // Limit to 16 characters

      setFormData((prev) => ({ ...prev, [name]: formattedSlug }));
    } else if (name === 'name') {
      // Auto-generate slug from name if slug is empty or in create mode
      const shouldAutoGenerateSlug = mode === 'create' || !formData.slug;

      if (shouldAutoGenerateSlug) {
        const autoSlug = value
          .toUpperCase()
          .replace(/[^A-Z0-9\s-]/g, '') // Remove non-English characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
          .slice(0, 16); // Limit to 16 characters

        setFormData((prev) => ({ ...prev, [name]: value, slug: autoSlug }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    if (hasUnsavedChanges && showUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to go back? Your changes will be lost.',
      );
      if (!confirmed) return;
    }
    onCancel?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate slug before submission
    if (formData.slug && !isSlugValid(formData.slug)) {
      return; // Don't submit if slug is invalid
    }

    await onSubmit(formData);
  };

  const defaultSubmitText = mode === 'create' ? 'Create Project' : 'Save Changes';

  // Validate slug
  const isSlugValid = (slug: string) => {
    return slug.length > 0 && slug.length <= 16 && /^[A-Z0-9-]+$/.test(slug);
  };

  return (
    <form onSubmit={handleSubmit} ref={ref} className={cn('space-y-6', className)}>
      {(showBackButton || showArchiveButton || showUnsavedChanges) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            {showBackButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs px-2 py-1 h-auto"
              >
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}

            {showArchiveButton && (
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
            )}

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && showUnsavedChanges && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-medium">
                <AlertCircleIcon className="h-3 w-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          {showSubmitButton && (
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={
                isSubmitting ||
                (mode === 'edit' && !hasUnsavedChanges) ||
                (formData.slug.length > 0 && !isSlugValid(formData.slug))
              }
              className={cn(
                'text-xs px-2 py-1 h-auto transition-all',
                hasUnsavedChanges && 'ring-2 ring-blue-500/20 shadow-sm',
              )}
            >
              <CheckIcon className="h-3 w-3 mr-1" />
              {isSubmitting ? 'Saving...' : submitButtonText || defaultSubmitText}
            </Button>
          )}
        </div>
      )}

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
        <div className="space-y-1">
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={cn(
              'text-sm w-full border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0 text-muted-foreground',
              formData.slug && !isSlugValid(formData.slug) && 'text-red-500',
            )}
            placeholder="PROJECT-SLUG"
            maxLength={16}
          />
          {formData.slug && !isSlugValid(formData.slug) && (
            <p className="text-xs text-red-500">
              Slug must be uppercase, only English letters/numbers/hyphens, max 16 characters
            </p>
          )}
          {formData.slug && formData.slug.length > 0 && (
            <p className="text-xs text-muted-foreground">{formData.slug.length}/16 characters</p>
          )}
        </div>
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
          <TeamMultiSelector
            type="inline"
            value={formData.teamIds}
            onSelect={(value) => handleSelectChange('teamIds', value)}
            teams={teams}
            loading={teamsLoading}
            placeholder="Select teams"
            maxDisplayItems={2}
          />
          <ProjectTypeSelector
            type="inline"
            value={formData.type}
            onSelect={(value) => handleSelectChange('type', value)}
          />
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
        <DependenciesMultiSelector
          value={formData.dependencies}
          onSelect={(value) => handleSelectChange('dependencies', value)}
          dependencies={teams}
          loading={teamsLoading}
          placeholder="Select dependencies..."
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

      {showCreatedDate && initialData?.createdAt && (
        <div className="pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3 opacity-70" />
            <span>Created: {format(new Date(initialData.createdAt), 'PP')}</span>
          </div>
        </div>
      )}
    </form>
  );
});
