'use client';

import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';
import { getProjectStyles } from '@/lib/utils/project-styling';

interface WeekBlockProps {
  project?: Project;
  isCompact?: boolean;
  className?: string;
}

export function WeekBlock({ project, isCompact = false, className }: WeekBlockProps) {
  if (project) {
    const { classes, icon } = getProjectStyles(project);

    // Get project color for gradient
    const selectedColorName = project?.color;
    const colorObj = getProjectColorByName(selectedColorName) || getDefaultProjectColor();
    const colorHex = colorObj.hex;

    return (
      <div
        className={cn(
          'flex items-center justify-start h-full w-full border-0 min-w-20 px-2 shadow-sm relative overflow-hidden',
          classes,
          className,
        )}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-30"
          style={{
            background: `linear-gradient(135deg, ${colorHex} 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 flex items-center justify-start w-full">
          {!isCompact && icon}
          <span className="text-xs font-medium truncate">{project.slug}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center h-full w-full border-0 min-w-20 bg-slate-50 dark:bg-slate-900/20',
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">--</span>
    </div>
  );
}
