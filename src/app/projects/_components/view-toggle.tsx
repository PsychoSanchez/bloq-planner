'use client';

import { LayoutGridIcon, TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';

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
    <div className={`flex items-center border rounded-md ${className}`}>
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('table')}
        className="rounded-r-none border-r"
      >
        <TableIcon className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={currentView === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('cards')}
        className="rounded-l-none"
      >
        <LayoutGridIcon className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Cards</span>
      </Button>
    </div>
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
