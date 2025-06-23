'use client';

import { useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CalendarIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
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
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

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

// Additional exports for external button implementations
export interface ProjectFormRef {
  submit: () => void;
  hasUnsavedChanges: boolean;
  isSlugValid: boolean;
  formData: ProjectFormData;
  setValue: (field: keyof ProjectFormData, value: string | boolean | string[] | Record<string, number>) => void;
  handleCancel: () => void;
  handleToggleArchive: () => void;
}

export interface ProjectFormProps {
  // Data
  initialData?: Partial<Project>;
  teams: TeamOption[];
  teamsLoading: boolean;

  // Behavior
  mode: 'create' | 'edit';

  // Callbacks
  onSubmit: (data: ProjectFormData) => Promise<void> | void;
  onFormStateChange?: (hasUnsavedChanges: boolean, isSlugValid: boolean) => void;

  // UI customization
  showCreatedDate?: boolean;
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

export const ProjectForm = forwardRef<ProjectFormRef, ProjectFormProps>(function ProjectForm(
  { initialData, teams, teamsLoading, mode, onSubmit, onFormStateChange, showCreatedDate = false, className },
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
    if (mode === 'create') return false;
    return isDirty;
  }, [isDirty, mode]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    if (mode === 'create') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, mode]);

  // Notify parent of form state changes
  useEffect(() => {
    const isSlugValidValue = watchedSlug.length === 0 || isSlugValid(watchedSlug);
    onFormStateChange?.(hasUnsavedChanges, isSlugValidValue);
  }, [hasUnsavedChanges, watchedSlug, onFormStateChange]);

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
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to go back? Your changes will be lost.',
      );
      if (!confirmed) return;
    }
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

  // Expose form methods via ref
  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(onFormSubmit)();
    },
    hasUnsavedChanges,
    isSlugValid: watchedSlug.length === 0 || isSlugValid(watchedSlug),
    formData: watch(),
    setValue,
    handleCancel,
    handleToggleArchive,
  }));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn('space-y-6', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Input
            {...register('name', { required: 'Project name is required' })}
            className="md:text-xl text-xl font-bold w-full border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0"
            placeholder="Project Name"
          />
          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <Popover>
              <PopoverTrigger asChild className="cursor-pointer">
                <AlertCircleIcon className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 rounded-md bg-background border border-border shadow-md" side="left">
                <p className="text-xs text-muted-foreground">Unsaved changes</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
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
                          step="0.1"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                            // Round to 1 decimal place
                            const roundedValue = Math.round(value * 10) / 10;
                            field.onChange(roundedValue);
                          }}
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
