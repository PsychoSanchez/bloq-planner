import React from 'react';
import {
  Wrench,
  Calendar,
  ArrowRightCircle,
  XCircle,
  Sparkles,
  FileCode2,
  Thermometer,
  PalmtreeIcon,
  GraduationCap,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';

// Helper function to get project icon with flexible className
export const getProjectIcon = (projectType?: string, className = 'h-3.5 w-3.5') => {
  if (!projectType) return null;

  switch (projectType) {
    case 'tech-debt':
      return <Wrench className={className} />;
    case 'team-event':
      return <Calendar className={className} />;
    case 'spillover':
      return <ArrowRightCircle className={className} />;
    case 'blocked':
      return <XCircle className={className} />;
    case 'hack':
      return <Sparkles className={className} />;
    case 'sick-leave':
      return <Thermometer className={className} />;
    case 'vacation':
      return <PalmtreeIcon className={className} />;
    case 'onboarding':
      return <GraduationCap className={className} />;
    case 'duty':
      return <Shield className={className} />;
    case 'risky-week':
      return <AlertTriangle className={className} />;
    default:
      return <FileCode2 className={className} />;
  }
};

// Helper function to get project styles and icon
export const getProjectStyles = (project?: Project) => {
  let classes = 'bg-muted text-muted-foreground border-l-4 border-transparent';
  const projectType = project?.type;

  const icon = getProjectIcon(projectType, 'h-3.5 w-3.5 mr-1 flex-shrink-0');

  const selectedColorName = project?.color;
  const colorObj = getProjectColorByName(selectedColorName) || (projectType ? null : getDefaultProjectColor());

  if (colorObj) {
    classes = colorObj.cn;
  } else if (projectType) {
    switch (projectType) {
      case 'tech-debt':
        classes = 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-l-4 border-amber-400';
        break;
      case 'team-event':
        classes = 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-l-4 border-blue-400';
        break;
      case 'spillover':
        classes =
          'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-l-4 border-purple-400';
        break;
      case 'blocked':
        classes = 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-l-4 border-red-400';
        break;
      case 'hack':
        classes =
          'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-l-4 border-indigo-400';
        break;
      case 'sick-leave':
        classes = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-l-4 border-rose-400';
        break;
      case 'vacation':
        classes = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border-l-4 border-cyan-400';
        break;
      case 'onboarding':
        classes = 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-200 border-l-4 border-lime-400';
        break;
      case 'duty':
        classes = 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-l-4 border-sky-400';
        break;
      case 'risky-week':
        classes =
          'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-400';
        break;
      default:
        classes =
          'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-400';
        break;
    }
  } else {
    const defaultColorObj = getDefaultProjectColor();
    classes = defaultColorObj.cn;
  }

  return { classes, icon };
};
