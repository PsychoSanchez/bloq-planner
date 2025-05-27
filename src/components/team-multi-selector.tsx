'use client';

import { useMemo } from 'react';
import { UserIcon } from 'lucide-react';
import { MultiSelector, MultiSelectorOption } from '@/components/ui/multi-selector';

export interface TeamOption {
  id: string;
  name: string;
  role: string;
  type: 'person' | 'team' | 'dependency' | 'event';
}

interface TeamMultiSelectorProps {
  value: string[];
  onSelect: (teamIds: string[]) => void;
  placeholder?: string;
  className?: string;
  teams: TeamOption[];
  loading?: boolean;
  type?: 'inline' | 'dropdown';
  maxDisplayItems?: number;
}

export function TeamMultiSelector({
  value,
  onSelect,
  placeholder = 'Select teams...',
  className,
  teams,
  loading = false,
  type = 'dropdown',
  maxDisplayItems = 2,
}: TeamMultiSelectorProps) {
  // Convert teams to MultiSelectorOption format with enhanced search text
  // Only include team members with type 'team'
  const teamOptions: MultiSelectorOption[] = useMemo(() => {
    return teams
      .filter((team) => team.type === 'team')
      .map((team) => ({
        id: team.id,
        value: team.id,
        name: team.name,
        searchText: `${team.name} ${team.role}`, // Include role for better search
      }));
  }, [teams]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <UserIcon className="w-4 h-4" />
        Loading teams...
      </div>
    );
  }

  return (
    <MultiSelector
      options={teamOptions}
      value={value}
      onSelect={onSelect}
      type={type}
      isIconEnabled={true}
      icon={<UserIcon className="w-4 h-4" />}
      placeholder={placeholder}
      searchPlaceholder="Search teams..."
      className={className}
      maxDisplayItems={maxDisplayItems}
    />
  );
}
