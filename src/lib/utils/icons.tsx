import React from 'react';
import { ROLE_OPTIONS } from '../constants';

// Re-export the project icon function from project-styling
export { getProjectIcon } from './project-styling';

// Helper function to get role icon
export const getRoleIcon = (role?: string) => {
  if (!role) return null;

  const roleOption = ROLE_OPTIONS.find((r) => r.id === role);
  if (!roleOption) return null;

  const IconComponent = roleOption.icon;
  return <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />;
};
