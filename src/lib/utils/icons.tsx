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
import { ROLE_OPTIONS } from '../constants';

// Helper function to get project icon
export const getProjectIcon = (projectType: string) => {
  switch (projectType) {
    case 'tech-debt':
      return <Wrench className="h-3.5 w-3.5" />;
    case 'team-event':
      return <Calendar className="h-3.5 w-3.5" />;
    case 'spillover':
      return <ArrowRightCircle className="h-3.5 w-3.5" />;
    case 'blocked':
      return <XCircle className="h-3.5 w-3.5" />;
    case 'hack':
      return <Sparkles className="h-3.5 w-3.5" />;
    case 'sick-leave':
      return <Thermometer className="h-3.5 w-3.5" />;
    case 'vacation':
      return <PalmtreeIcon className="h-3.5 w-3.5" />;
    case 'onboarding':
      return <GraduationCap className="h-3.5 w-3.5" />;
    case 'duty':
      return <Shield className="h-3.5 w-3.5" />;
    case 'risky-week':
      return <AlertTriangle className="h-3.5 w-3.5" />;
    default:
      return <FileCode2 className="h-3.5 w-3.5" />;
  }
};

// Helper function to get role icon
export const getRoleIcon = (role?: string) => {
  if (!role) return null;

  const roleOption = ROLE_OPTIONS.find((r) => r.id === role);
  if (!roleOption) return null;

  const IconComponent = roleOption.icon;
  return <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />;
};
