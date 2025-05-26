'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArchiveIcon, ArchiveRestoreIcon, XIcon, CheckIcon, EditIcon } from 'lucide-react';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-selector';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { ColorSelector } from '@/components/color-selector';
import { PrioritySelector } from '@/components/priroty-selector';
import { ProjectAreaSelector } from '@/components/project-area-selector';
import { TeamSelector } from '@/components/team-selector';
import { PersonSelector } from '@/components/person-selector';
import { QuarterMultiSelector } from './quarter-multi-selector';
import { ProjectTypeSelector } from '@/components/project-type-selector';
import { DEFAULT_PROJECT_COLOR_NAME } from '@/lib/project-colors';

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!project) return null;

  const handleStartEdit = (field: string, currentValue: string = '') => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingField && onUpdateProject) {
      onUpdateProject(project.id, { [editingField]: editValue });
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSelectChange = (field: string, value: string | string[]) => {
    if (!onUpdateProject || !project) return;

    if (field === 'quarters') {
      onUpdateProject(project.id, { quarters: Array.isArray(value) ? value : [value] });
    } else if (field === 'teamIds') {
      onUpdateProject(project.id, { teamIds: typeof value === 'string' ? (value ? [value] : []) : value });
    } else {
      onUpdateProject(project.id, { [field]: value });
    }
  };

  const handleArchiveToggle = () => {
    if (onUpdateProject) {
      onUpdateProject(project.id, { archived: !project.archived });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[600px] overflow-y-auto px-4 py-6">
        <SheetHeader className="pb-6 px-0 border-b">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <SheetTitle className="text-xl font-semibold leading-tight">{project.name}</SheetTitle>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {project.archived && (
                  <Badge variant="secondary" className="gap-1">
                    <ArchiveIcon className="h-3 w-3" />
                    Archived
                  </Badge>
                )}
                <ProjectTypeBadge type={project.type} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-foreground">Basic Information</h3>

            {/* Project Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Project Name
                </Label>
                {editingField !== 'name' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleStartEdit('name', project.name)}
                  >
                    <EditIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {editingField === 'name' ? (
                <div className="space-y-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="h-7 px-3">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 px-3">
                      <XIcon className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-foreground bg-muted/30 rounded-md p-3 border border-border/50">
                  {project.name}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </Label>
                {editingField !== 'description' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleStartEdit('description', project.description || '')}
                  >
                    <EditIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {editingField === 'description' ? (
                <div className="space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-sm min-h-[100px] resize-none"
                    placeholder="Add project description..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="h-7 px-3">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 px-3">
                      <XIcon className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border border-border/50 min-h-[60px] flex items-start">
                  {project.description || (
                    <span className="italic text-muted-foreground/70">No description provided</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Project Properties */}
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-foreground">Project Properties</h3>

            <div className="space-y-4">
              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</Label>
                  <ProjectTypeSelector
                    type="inline"
                    value={project.type}
                    onSelect={(value) => handleSelectChange('type', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</Label>
                  <PrioritySelector
                    type="inline"
                    value={project.priority || 'medium'}
                    onSelect={(value) => handleSelectChange('priority', value)}
                  />
                </div>
              </div>

              {/* Quarter & Area */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quarter</Label>
                  <QuarterMultiSelector
                    type="inline"
                    value={project.quarters || []}
                    onSelect={(value) => handleSelectChange('quarters', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Area</Label>
                  <ProjectAreaSelector
                    type="inline"
                    value={project.area || ''}
                    onSelect={(value) => handleSelectChange('area', value)}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</Label>
                <ColorSelector
                  selectedColorName={project.color || DEFAULT_PROJECT_COLOR_NAME}
                  onColorChange={(color) => handleSelectChange('color', color)}
                />
              </div>

              {/* Team */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</Label>
                <TeamSelector
                  type="inline"
                  value={(project.teamIds && project.teamIds.length > 0 ? project.teamIds[0] : '') || ''}
                  onSelect={(value) => handleSelectChange('teamIds', value)}
                  teams={teams}
                  loading={teamsLoading}
                  placeholder="Select team"
                />
              </div>

              {/* Lead */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Project Lead
                </Label>
                <PersonSelector
                  type="inline"
                  value={project.leadId || ''}
                  onSelect={(value) => handleSelectChange('leadId', value)}
                  teams={teams}
                  loading={teamsLoading}
                  placeholder="Select lead"
                />
              </div>
            </div>
          </div>

          {/* Dependencies */}
          {project.dependencies && project.dependencies.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-foreground">Dependencies</h3>
              <div className="space-y-3">
                {project.dependencies.map((dep, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="text-sm font-medium">{dep.team}</div>
                        <div className="text-xs text-muted-foreground">{dep.description}</div>
                      </div>
                      <Badge variant={dep.status === 'approved' ? 'default' : 'secondary'} className="flex-shrink-0">
                        {dep.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {(project.createdAt || project.updatedAt) && (
            <div className="space-y-3 pt-6 border-t">
              <h3 className="text-sm font-medium text-foreground">Metadata</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                {project.createdAt && (
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {project.updatedAt && (
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Archive/Unarchive Action */}
        {onUpdateProject && (
          <div className="sticky bottom-0 bg-background pt-6 border-t">
            <Button
              variant={project.archived ? 'default' : 'outline'}
              onClick={handleArchiveToggle}
              className="w-full h-10"
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
