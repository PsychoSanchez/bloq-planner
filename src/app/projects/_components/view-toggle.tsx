'use client';

import { LayoutGridIcon, TableIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type ViewMode = 'table' | 'cards';

interface ViewToggleProps {
  className?: string;
}

export function ViewToggle({ className }: ViewToggleProps) {
  const [viewMode, setViewMode] = useQueryState('view', parseAsString.withDefault('auto'));

  // Auto-detect mobile and set default view
  useEffect(() => {
    if (viewMode === 'auto') {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setViewMode(isMobile ? 'cards' : 'table', { shallow: true });
    }
  }, [viewMode, setViewMode]);

  const currentView = viewMode === 'auto' ? 'table' : viewMode;

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
  };

  return (
    <ToggleGroup
      className={className}
      type="single"
      variant="outline"
      value={currentView}
      onValueChange={handleViewChange}
    >
      <ToggleGroupItem value="table" className="text-xs">
        <TableIcon className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Table</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="cards" className="text-xs">
        <LayoutGridIcon className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Cards</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function useViewMode(): ViewMode {
  const [viewMode] = useQueryState('view', parseAsString.withDefault('auto'));

  // Auto-detect mobile for default view
  if (viewMode === 'auto') {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'cards' : 'table';
    }
    return 'table'; // SSR fallback
  }

  return viewMode as ViewMode;
}
