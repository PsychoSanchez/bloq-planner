'use client';

import { useMemo } from 'react';
import { LinkIcon } from 'lucide-react';
import { MultiSelector, MultiSelectorOption } from '@/components/ui/multi-selector';

export interface DependencyOption {
  id: string;
  name: string;
  role: string;
  type: 'person' | 'team' | 'dependency' | 'event';
}

interface DependenciesMultiSelectorProps {
  value: string[];
  onSelect: (dependencyIds: string[]) => void;
  placeholder?: string;
  className?: string;
  dependencies: DependencyOption[];
  loading?: boolean;
  type?: 'inline' | 'dropdown';
  maxDisplayItems?: number;
}

export function DependenciesMultiSelector({
  value,
  onSelect,
  placeholder = 'Select dependencies...',
  className,
  dependencies,
  loading = false,
  type = 'dropdown',
  maxDisplayItems = 2,
}: DependenciesMultiSelectorProps) {
  // Convert dependencies to MultiSelectorOption format with enhanced search text
  // Include all team members regardless of type
  const dependencyOptions: MultiSelectorOption[] = useMemo(() => {
    return dependencies.map((dependency) => ({
      id: dependency.id,
      value: dependency.id,
      name: dependency.name,
      searchText: `${dependency.name} ${dependency.role} ${dependency.type}`, // Include role and type for better search
    }));
  }, [dependencies]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <LinkIcon className="w-4 h-4" />
        Loading dependencies...
      </div>
    );
  }

  return (
    <MultiSelector
      options={dependencyOptions}
      value={value}
      onSelect={onSelect}
      type={type}
      isIconEnabled={true}
      icon={<LinkIcon className="w-4 h-4" />}
      placeholder={placeholder}
      searchPlaceholder="Search dependencies..."
      className={className}
      maxDisplayItems={maxDisplayItems}
    />
  );
}
