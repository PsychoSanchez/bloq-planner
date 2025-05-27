'use client';

import { parseAsString, parseAsBoolean, useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { ArchiveIcon, SearchIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ProjectGroupSelector } from '@/app/projects/_components/project-group-selector';
import { ProjectSortSelector } from '@/app/projects/_components/project-sort-selector';
import { AdvancedProjectFilters } from '@/app/projects/_components/advanced-project-filters';
import { Button } from '@/components/ui/button';
import { TeamOption } from '@/components/team-selector';
import { ColumnToggle } from '@/app/projects/_components/column-toggle';
import { ColumnDefinition } from '@/hooks/use-column-visibility';

interface SearchProjectsProps {
  teams: TeamOption[];
  teamsLoading: boolean;
  columns: ColumnDefinition[];
  isColumnVisible: (columnId: string) => boolean;
  toggleColumn: (columnId: string) => void;
  resetToDefaults: () => void;
}

export function SearchProjects({
  teams,
  teamsLoading,
  columns,
  isColumnVisible,
  toggleColumn,
  resetToDefaults,
}: SearchProjectsProps) {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));

  const [includeArchived, setIncludeArchived] = useQueryState('includeArchived', parseAsBoolean.withDefault(false));

  const debouncedUpdateParams = useDebounce(setSearch, 300);

  // Update search params and navigate
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedUpdateParams(e.target.value, undefined);
    },
    [debouncedUpdateParams],
  );

  const handleArchivedToggle = useCallback(() => {
    setIncludeArchived((prev) => !prev);
  }, [setIncludeArchived]);

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Search and basic controls */}
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-9"
              defaultValue={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Archive Toggle */}
          <Button variant="outline" size="default" className="h-9 px-3 gap-2" onClick={handleArchivedToggle}>
            <ArchiveIcon
              className={`h-4 w-4 ${includeArchived ? 'text-foreground' : 'text-muted-foreground'}`}
              strokeWidth={includeArchived ? 2 : 1}
            />
            <span className="text-sm">{includeArchived ? 'Hide Archived' : 'Show Archived'}</span>
          </Button>
        </div>

        {/* View Controls */}
        <div className="flex gap-2 items-center">
          <ColumnToggle
            columns={columns}
            isColumnVisible={isColumnVisible}
            toggleColumn={toggleColumn}
            resetToDefaults={resetToDefaults}
          />
          <ProjectGroupSelector />
          <ProjectSortSelector />
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedProjectFilters teams={teams} teamsLoading={teamsLoading} />
    </div>
  );
}
