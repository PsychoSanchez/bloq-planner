'use client';

import { parseAsString, parseAsBoolean, useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterIcon, ArchiveIcon, SearchIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ProjectGroupSelector } from './project-group-selector';
import { ProjectSortSelector } from './project-sort-selector';
import { AdvancedProjectFilters } from './advanced-project-filters';
import { Button } from './ui/button';
import { TeamOption } from './team-selector';

interface SearchProjectsProps {
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function SearchProjects({ teams, teamsLoading }: SearchProjectsProps) {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [type, setType] = useQueryState('type', parseAsString.withDefault('all'));
  const [includeArchived, setIncludeArchived] = useQueryState('includeArchived', parseAsBoolean.withDefault(false));

  const debouncedUpdateParams = useDebounce(setSearch, 300);

  // Update search params and navigate
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedUpdateParams(e.target.value, undefined);
    },
    [debouncedUpdateParams],
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setType(value);
    },
    [setType],
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

          {/* Type Filter */}
          <Select defaultValue={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="h-10 w-[140px] text-sm gap-2">
              <FilterIcon className="h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs">Project Types</SelectLabel>
                <SelectItem value="all" className="text-sm py-2">
                  All Types
                </SelectItem>
                <SelectItem value="regular" className="text-sm py-2">
                  Regular
                </SelectItem>
                <SelectItem value="tech-debt" className="text-sm py-2">
                  Tech Debt
                </SelectItem>
                <SelectItem value="team-event" className="text-sm py-2">
                  Team Event
                </SelectItem>
                <SelectItem value="spillover" className="text-sm py-2">
                  Spillover
                </SelectItem>
                <SelectItem value="blocked" className="text-sm py-2">
                  Blocked
                </SelectItem>
                <SelectItem value="hack" className="text-sm py-2">
                  Hack
                </SelectItem>
                <SelectItem value="sick-leave" className="text-sm py-2">
                  Sick Leave
                </SelectItem>
                <SelectItem value="vacation" className="text-sm py-2">
                  Vacation
                </SelectItem>
                <SelectItem value="onboarding" className="text-sm py-2">
                  Onboarding
                </SelectItem>
                <SelectItem value="duty" className="text-sm py-2">
                  Team Duty
                </SelectItem>
                <SelectItem value="risky-week" className="text-sm py-2">
                  Risk Alert
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

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
          <ProjectGroupSelector />
          <ProjectSortSelector />
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedProjectFilters teams={teams} teamsLoading={teamsLoading} />
    </div>
  );
}
