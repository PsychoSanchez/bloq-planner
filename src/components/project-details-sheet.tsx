'use client';

import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';
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
          .map(([department, value]) => ({
            department,
            value: typeof value === 'string' ? parseInt(value, 10) || 0 : value,
          }))
          .filter(({ value }) => value > 0),
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

        {/* Floating Action Buttons at Bottom */}
        {onUpdateProject && (
          <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg p-4 z-50">
            <div className="max-w-[600px] mx-auto">
              <div className="flex gap-3">
                <Button onClick={handleSaveClick} className="flex-1 h-10" disabled={isSubmitting}>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                  variant={project.archived ? 'default' : 'destructive'}
                  onClick={handleArchiveToggle}
                  className="flex-1 h-10"
                  disabled={isSubmitting}
                >
                  {project.archived ? (
                    <>
                      <ArchiveRestoreIcon className="h-4 w-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <ArchiveIcon className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
