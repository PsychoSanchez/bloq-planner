import {
  InlineSelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import { Select } from './ui/select';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PrioritySelectorProps {
  value: string;
  onSelect: (value: string) => void;
  type?: 'inline' | 'dropdown';
}

export const PrioritySelector = ({ value, onSelect, type = 'dropdown' }: PrioritySelectorProps) => {
  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;
  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectComponent className="px-2" id="priority">
        <SelectValue placeholder="Select priority" />
      </SelectComponent>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground font-medium">Priority</SelectLabel>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <option.icon className={cn('h-4 w-4', option.cn)} />
              <span className={cn('text-gray-500', option.cn)}>{option.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
