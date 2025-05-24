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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FilterIcon, ArchiveIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ProjectGroupSelector } from './project-group-selector';
import { ProjectSortSelector } from './project-sort-selector';

export function SearchProjects() {
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

  const handleArchivedToggle = useCallback(
    (checked: boolean) => {
      setIncludeArchived(checked);
    },
    [setIncludeArchived],
  );

  return (
    <div className="flex gap-2 items-center mb-2 justify-end">
      <Input
        type="search"
        placeholder="Search projects..."
        className="max-w-xs"
        defaultValue={search}
        onChange={handleSearchChange}
      />
      <Select defaultValue={type} onValueChange={handleTypeChange}>
        <SelectTrigger className="h-8 w-[130px] text-xs gap-1">
          <FilterIcon className="h-3.5 w-3.5" />
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs">Project Types</SelectLabel>
            <SelectItem value="all" className="text-xs py-1">
              All Types
            </SelectItem>
            <SelectItem value="regular" className="text-xs py-1">
              Regular
            </SelectItem>
            <SelectItem value="tech-debt" className="text-xs py-1">
              Tech Debt
            </SelectItem>
            <SelectItem value="team-event" className="text-xs py-1">
              Team Event
            </SelectItem>
            <SelectItem value="spillover" className="text-xs py-1">
              Spillover
            </SelectItem>
            <SelectItem value="blocked" className="text-xs py-1">
              Blocked
            </SelectItem>
            <SelectItem value="hack" className="text-xs py-1">
              Hack
            </SelectItem>
            <SelectItem value="sick-leave" className="text-xs py-1">
              Sick Leave
            </SelectItem>
            <SelectItem value="vacation" className="text-xs py-1">
              Vacation
            </SelectItem>
            <SelectItem value="onboarding" className="text-xs py-1">
              Onboarding
            </SelectItem>
            <SelectItem value="duty" className="text-xs py-1">
              Team Duty
            </SelectItem>
            <SelectItem value="risky-week" className="text-xs py-1">
              Risk Alert
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Switch id="include-archived" checked={includeArchived} onCheckedChange={handleArchivedToggle} />
        <Label htmlFor="include-archived" className="text-xs text-muted-foreground flex items-center gap-1">
          <ArchiveIcon className="h-3.5 w-3.5" />
          Show archived
        </Label>
      </div>
      <ProjectGroupSelector />
      <ProjectSortSelector />
    </div>
  );
}
