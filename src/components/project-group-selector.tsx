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
import { GroupIcon } from 'lucide-react';

export type GroupByOption = 'none' | 'type' | 'priority' | 'team' | 'lead' | 'area' | 'quarter';

interface ProjectGroupSelectorProps {
  type?: 'inline' | 'dropdown';
}

export function ProjectGroupSelector({ type = 'dropdown' }: ProjectGroupSelectorProps) {
  const [groupBy, setGroupBy] = useQueryState('groupBy', parseAsString.withDefault('none'));

  const handleGroupByChange = useCallback(
    (value: string) => {
      setGroupBy(value as GroupByOption);
    },
    [setGroupBy],
  );

  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;

  return (
    <Select defaultValue={groupBy} onValueChange={handleGroupByChange}>
      <SelectComponent className="w-[130px] text-xs gap-1">
        <GroupIcon className="h-3.5 w-3.5" />
        <SelectValue placeholder="Group by" />
      </SelectComponent>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs">Group By</SelectLabel>
          <SelectItem value="none" className="text-xs py-1">
            No Grouping
          </SelectItem>
          <SelectItem value="type" className="text-xs py-1">
            Type
          </SelectItem>
          <SelectItem value="priority" className="text-xs py-1">
            Priority
          </SelectItem>
          <SelectItem value="team" className="text-xs py-1">
            Team
          </SelectItem>
          <SelectItem value="lead" className="text-xs py-1">
            Lead
          </SelectItem>
          <SelectItem value="area" className="text-xs py-1">
            Area
          </SelectItem>
          <SelectItem value="quarter" className="text-xs py-1">
            Quarter
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
