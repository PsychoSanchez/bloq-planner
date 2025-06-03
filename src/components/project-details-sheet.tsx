'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { ProjectForm, ProjectFormData } from '@/components/project-form';
import { ArchiveIcon, ArchiveRestoreIcon, CheckIcon } from 'lucide-react';

interface ProjectDetailsSheetProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function ProjectDetailsSheet({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  teams,
  teamsLoading,
}: ProjectDetailsSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);

  if (!project) return null;

  const handleSubmit = async (formData: ProjectFormData) => {
    if (!onUpdateProject) return;

    setIsSubmitting(true);

    try {
      // Convert form data to project updates
      const updates: Partial<Project> = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        area: formData.area,
        priority: formData.priority,
        description: formData.description,
        color: formData.color,
        teamIds: formData.teamIds,
        leadId: formData.leadId,
        quarters: formData.quarters,
        archived: formData.archived,
        cost: typeof formData.cost === 'string' ? parseFloat(formData.cost) || undefined : formData.cost,
        impact: typeof formData.impact === 'string' ? parseFloat(formData.impact) || undefined : formData.impact,
        dependencies: formData.dependencies
          ? formData.dependencies.map((dep) => ({
              team: dep,
              status: 'pending' as const,
              description: '',
            }))
          : [],
        estimates: Object.entries(formData.estimates)
          .filter(([, value]) => value > 0)
          .map(([department, value]) => ({
            department,
            value,
          })),
      };

      await onUpdateProject(project.id, updates);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!onUpdateProject) return;

    try {
      await onUpdateProject(project.id, { archived: !project.archived });
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  const handleSaveClick = () => {
    if (formRef) {
      formRef.requestSubmit();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto px-4 py-6">
        <SheetHeader className="pb-6 px-0 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-semibold">Edit Project</SheetTitle>
              <p className="text-sm text-muted-foreground">Update project details and settings</p>
            </div>
            <div className="flex items-center gap-2">
              {project.archived && (
                <Badge variant="secondary" className="gap-1">
                  <ArchiveIcon className="h-3 w-3" />
                  Archived
                </Badge>
              )}
              <ProjectTypeBadge type={project.type} />
            </div>
          </div>
        </SheetHeader>

        <ProjectForm
          mode="edit"
          initialData={project}
          teams={teams}
          teamsLoading={teamsLoading}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={onClose}
          showBackButton={false}
          showArchiveButton={false}
          showCreatedDate={true}
          showUnsavedChanges={true}
          showSubmitButton={false}
          className="space-y-6"
          ref={setFormRef}
        />

        {/* Action Buttons at Bottom */}
        <div className="pt-6 border-t space-y-3">
          {onUpdateProject && (
            <>
              <Button onClick={handleSaveClick} className="w-full h-10" disabled={isSubmitting}>
                <CheckIcon className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                variant={project.archived ? 'default' : 'outline'}
                onClick={handleArchiveToggle}
                className="w-full h-10"
                disabled={isSubmitting}
              >
                {project.archived ? (
                  <>
                    <ArchiveRestoreIcon className="h-4 w-4 mr-2" />
                    Unarchive Project
                  </>
                ) : (
                  <>
                    <ArchiveIcon className="h-4 w-4 mr-2" />
                    Archive Project
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
