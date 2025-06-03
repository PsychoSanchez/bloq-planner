'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MousePointer2, Paintbrush, Eraser, GlassesIcon } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';
import { getProjectIcon } from '@/lib/utils/icons';
import { cn } from '@/lib/utils';
import { parseAsStringEnum, useQueryState } from 'nuqs';

export type PlannerMode = 'pointer' | 'paint' | 'erase' | 'inspect';

interface PlannerToolbarProps {
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  regularProjects: Project[];
  defaultProjects: Project[];
}

export function usePlannerToolbarMode() {
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringEnum(['pointer', 'paint', 'erase', 'inspect']).withDefault('pointer'),
  );

  return [mode, setMode] as const;
}

export function PlannerToolbar({
  selectedProjectId,
  onProjectSelect,
  regularProjects,
  defaultProjects,
}: PlannerToolbarProps) {
  const [mode, setMode] = usePlannerToolbarMode();
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);

  const handleModeChange = (value: string | undefined) => {
    if (value) {
      const newMode = value as PlannerMode;

      // If paint mode is selected, automatically open project selector
      if (newMode === 'paint') {
        setMode(newMode);
        setIsProjectSelectorOpen(true);
      } else {
        setMode(newMode);
        setIsProjectSelectorOpen(false);
      }
    }
  };

  const handleProjectSelect = (projectId: string) => {
    onProjectSelect(projectId);
    setIsProjectSelectorOpen(false);
  };

  const handleProjectSelectorOpenChange = (open: boolean) => {
    setIsProjectSelectorOpen(open);

    // If popover is closed and we're in paint mode but no project is selected,
    // reset to pointer mode
    if (!open && mode === 'paint' && !selectedProjectId) {
      setMode('pointer');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Mode Selection */}
      <ToggleGroup type="single" variant="outline" value={mode} onValueChange={handleModeChange} className="h-8">
        <ToggleGroupItem value="pointer" className="text-xs px-3 h-8">
          <MousePointer2 className="h-4 w-4 mr-1" />
          Pointer
        </ToggleGroupItem>

        {/* Paint button with popover */}
        <Popover open={isProjectSelectorOpen} onOpenChange={handleProjectSelectorOpenChange}>
          <PopoverTrigger asChild>
            <ToggleGroupItem value="paint" className={cn('text-xs px-3 h-8', mode === 'paint' && 'bg-accent')}>
              <Paintbrush className="h-4 w-4 mr-1" />
              Paint
            </ToggleGroupItem>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="max-h-96 overflow-y-auto">
              {/* Regular projects */}
              {regularProjects.length > 0 && (
                <>
                  {regularProjects.map((project) => {
                    const projectColor = getProjectColorByName(project.color) || getDefaultProjectColor();
                    const borderClass = projectColor.borderColor;

                    return (
                      <div
                        key={project.id}
                        className={cn(
                          `flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground relative overflow-hidden border-l-4 ${borderClass}`,
                          selectedProjectId === project.id && 'bg-accent',
                        )}
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getProjectIcon(project.type)}
                          <span className="truncate font-normal">
                            <span className="text-muted-foreground">{project.slug}:</span> {project.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Default projects */}
              {defaultProjects.length > 0 && (
                <>
                  {regularProjects.length > 0 && <div className="border-t" />}
                  {defaultProjects.map((project) => {
                    const projectColor = getProjectColorByName(project.color) || getDefaultProjectColor();
                    const borderClass = projectColor.borderColor;

                    return (
                      <div
                        key={project.id}
                        className={cn(
                          `flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground relative overflow-hidden border-l-4 ${borderClass}`,
                          selectedProjectId === project.id && 'bg-accent',
                        )}
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getProjectIcon(project.type)}
                          <span className="truncate text-muted-foreground font-normal">
                            <span className="text-muted-foreground/70">{project.slug}:</span> {project.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ToggleGroupItem value="erase" className="text-xs px-3 h-8">
          <Eraser className="h-4 w-4 mr-1" />
          Erase
        </ToggleGroupItem>
        <ToggleGroupItem value="inspect" className="text-xs px-3 h-8">
          <GlassesIcon className="h-4 w-4 mr-1" />
          Inspect
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
