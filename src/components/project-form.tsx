'use client';

import { useEffect, useMemo, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CheckIcon, ArrowLeftIcon, CalendarIcon, ArchiveIcon, ArchiveRestoreIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/lib/types';
import { ColorSelector } from '@/components/color-selector';
import { PROJECT_COLORS } from '@/lib/project-colors';
import { ROLES_TO_DISPLAY } from '@/lib/constants';
import { ROLE_OPTIONS } from '@/lib/constants';
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
  color: projectData?.color || PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]!.name,
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
      acc[role] = typeof estimate?.value === 'number' && estimate.value !== 0 ? estimate.value : 0;
      return acc;
    },
    {} as Record<string, number>,
  ),
});

// Function to get proper role display name
const getRoleDisplayName = (roleId: string): string => {
  const roleOption = ROLE_OPTIONS.find((option) => option.id === roleId);
  return roleOption?.name || roleId.charAt(0).toUpperCase() + roleId.slice(1).replace(/_/g, ' ');
};

// Slug validation function
const isSlugValid = (slug: string) => {
  return slug.length > 0 && slug.length <= 16 && /^[A-Z0-9-]+$/.test(slug);
};

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
  const defaultValues = useMemo(() => createFormDataFromProject(initialData), [initialData]);

  // Initialize React Hook Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProjectFormData>({
    defaultValues,
    mode: 'onChange',
  });

  // Watch form values for auto-slug generation and validation
  const watchedName = watch('name');
  const watchedSlug = watch('slug');
  const watchedArchived = watch('archived');

  // Reset form when initialData changes
  useEffect(() => {
    const newFormData = createFormDataFromProject(initialData);
    reset(newFormData);
  }, [initialData, reset]);

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' || !watchedSlug) {
      const autoSlug = watchedName
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, '') // Remove non-English characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .slice(0, 16); // Limit to 16 characters

      setValue('slug', autoSlug, { shouldValidate: true });
    }
  }, [watchedName, watchedSlug, mode, setValue]);

  // Determine if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!showUnsavedChanges || mode === 'create') return false;
    return isDirty;
  }, [isDirty, showUnsavedChanges, mode]);

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

  // Handle form submission
  const onFormSubmit = async (data: ProjectFormData) => {
    // Validate slug before submission
    if (data.slug && !isSlugValid(data.slug)) {
      return;
    }

    await onSubmit(data);
  };

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (hasUnsavedChanges && showUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to go back? Your changes will be lost.',
      );
      if (!confirmed) return;
    }
    onCancel?.();
  };

  // Handle archive toggle
  const handleToggleArchive = () => {
    setValue('archived', !watchedArchived, { shouldDirty: true });
  };

  // Handle slug input change with formatting
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedSlug = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 16);
    setValue('slug', formattedSlug, { shouldValidate: true, shouldDirty: true });
  };

  const defaultSubmitText = mode === 'create' ? 'Create Project' : 'Save Changes';

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} ref={ref} className={cn('space-y-6', className)}>
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
                {watchedArchived ? (
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
                (watchedSlug.length > 0 && !isSlugValid(watchedSlug))
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
          {...register('name', { required: 'Project name is required' })}
          className="md:text-xl text-xl font-bold w-full border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0"
          placeholder="Project Name"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

        <div className="space-y-1">
          <Input
            value={watchedSlug}
            onChange={handleSlugChange}
            className={cn(
              'text-sm w-full border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0 text-muted-foreground',
              watchedSlug && !isSlugValid(watchedSlug) && 'text-red-500',
            )}
            placeholder="PROJECT-SLUG"
            maxLength={16}
          />
          {watchedSlug && !isSlugValid(watchedSlug) && (
            <p className="text-xs text-red-500">
              Slug must be uppercase, only English letters/numbers/hyphens, max 16 characters
            </p>
          )}
          {watchedSlug && watchedSlug.length > 0 && (
            <p className="text-xs text-muted-foreground">{watchedSlug.length}/16 characters</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs text-muted-foreground font-medium">PROPERTIES</h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
          <Controller
            name="color"
            control={control}
            render={({ field }) => <ColorSelector selectedColorName={field.value} onColorChange={field.onChange} />}
          />
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <PrioritySelector
                type="inline"
                value={field.value}
                onSelect={(value) => field.onChange(value as 'low' | 'medium' | 'high' | 'urgent')}
              />
            )}
          />
          <Controller
            name="area"
            control={control}
            render={({ field }) => <ProjectAreaSelector type="inline" value={field.value} onSelect={field.onChange} />}
          />
          <Controller
            name="quarters"
            control={control}
            render={({ field }) => <QuarterMultiSelector type="inline" value={field.value} onSelect={field.onChange} />}
          />
          <Controller
            name="teamIds"
            control={control}
            render={({ field }) => (
              <TeamMultiSelector
                type="inline"
                value={field.value}
                onSelect={field.onChange}
                teams={teams}
                loading={teamsLoading}
                placeholder="Select teams"
                maxDisplayItems={2}
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => <ProjectTypeSelector type="inline" value={field.value} onSelect={field.onChange} />}
          />
          <Controller
            name="leadId"
            control={control}
            render={({ field }) => (
              <PersonSelector
                type="inline"
                value={field.value}
                onSelect={field.onChange}
                teams={teams}
                loading={teamsLoading}
                placeholder="Select lead"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-xs text-muted-foreground font-medium">
          DESCRIPTION
        </Label>
        <Textarea
          {...register('description')}
          className="w-full p-0 border border-transparent hover:border-muted focus:border-input focus:outline-none min-h-[60px] text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
          placeholder="Add a more detailed description..."
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="dependencies" className="text-xs text-muted-foreground font-medium">
          DEPENDENCIES
        </Label>
        <Controller
          name="dependencies"
          control={control}
          render={({ field }) => (
            <DependenciesMultiSelector
              value={field.value}
              onSelect={field.onChange}
              dependencies={teams}
              loading={teamsLoading}
              placeholder="Select dependencies..."
            />
          )}
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
                {...register('cost')}
                type="number"
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
                {...register('impact')}
                type="number"
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
                {...register('roi')}
                type="text"
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
                  <TableCell className="font-medium py-1 px-2 text-sm capitalize">{getRoleDisplayName(role)}</TableCell>
                  <TableCell className="py-1 px-2">
                    <Controller
                      name={`estimates.${role}` as const}
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0))
                          }
                          className="w-full p-1 border border-transparent hover:border-muted focus:border-input focus:outline-none h-auto text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
                          placeholder="0"
                        />
                      )}
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
