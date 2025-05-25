'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useCallback } from 'react';
import {
  InlineSelectTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDownIcon, ArrowDownAZIcon, ArrowDownZAIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SortByOption = 'name' | 'type' | 'priority' | 'createdAt' | 'updatedAt' | 'quarter' | 'area';
export type SortDirectionOption = 'asc' | 'desc';

interface ProjectSortSelectorProps {
  type?: 'inline' | 'dropdown';
}

export function ProjectSortSelector({ type = 'dropdown' }: ProjectSortSelectorProps) {
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault('name'));
  const [sortDirection, setSortDirection] = useQueryState('sortDirection', parseAsString.withDefault('asc'));

  const handleSortByChange = useCallback(
    (value: string) => {
      setSortBy(value as SortByOption);
    },
    [setSortBy],
  );

  const handleDirectionToggle = useCallback(() => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  }, [sortDirection, setSortDirection]);

  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;

  return (
    <div className="flex gap-1 items-center">
      <Select defaultValue={sortBy} onValueChange={handleSortByChange}>
        <SelectComponent className="w-[110px] text-xs gap-1">
          <ArrowUpDownIcon className="h-3.5 w-3.5" />
          <SelectValue placeholder="Sort by" />
        </SelectComponent>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs">Sort By</SelectLabel>
            <SelectItem value="name" className="text-xs py-1">
              Name
            </SelectItem>
            <SelectItem value="type" className="text-xs py-1">
              Type
            </SelectItem>
            <SelectItem value="priority" className="text-xs py-1">
              Priority
            </SelectItem>
            <SelectItem value="createdAt" className="text-xs py-1">
              Created Date
            </SelectItem>
            <SelectItem value="updatedAt" className="text-xs py-1">
              Modified Date
            </SelectItem>
            <SelectItem value="quarter" className="text-xs py-1">
              Quarter
            </SelectItem>
            <SelectItem value="area" className="text-xs py-1">
              Area
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDirectionToggle}
        className="h-9 w-9 p-0"
        title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'} - Click to toggle`}
      >
        {sortDirection === 'asc' ? (
          <ArrowDownAZIcon className="h-3.5 w-3.5" />
        ) : (
          <ArrowDownZAIcon className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
