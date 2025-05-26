'use client';

import { CalendarIcon } from 'lucide-react';
import { MultiSelector, MultiSelectorOption } from '@/components/ui/multi-selector';
import { QUARTER_OPTIONS } from '@/lib/constants';

interface QuarterMultiSelectorProps {
  value: string[];
  onSelect: (quarters: string[]) => void;
  type?: 'inline' | 'dropdown';
  isIconEnabled?: boolean;
  placeholder?: string;
  maxDisplayItems?: number;
}

// Convert QUARTER_OPTIONS to MultiSelectorOption format
const quarterOptions: MultiSelectorOption[] = QUARTER_OPTIONS.map((quarter) => ({
  id: quarter.id,
  value: quarter.value,
  name: quarter.name,
  searchText: quarter.name, // Use name for search
}));

export const QuarterMultiSelector = ({
  value,
  onSelect,
  type = 'dropdown',
  isIconEnabled = true,
  placeholder = 'Select quarters',
  maxDisplayItems = 2,
}: QuarterMultiSelectorProps) => {
  return (
    <MultiSelector
      options={quarterOptions}
      value={value}
      onSelect={onSelect}
      type={type}
      isIconEnabled={isIconEnabled}
      icon={<CalendarIcon className="w-4 h-4" />}
      placeholder={placeholder}
      searchPlaceholder="Search quarters..."
      maxDisplayItems={maxDisplayItems}
    />
  );
};
