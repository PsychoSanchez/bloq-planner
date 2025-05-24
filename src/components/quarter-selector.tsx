import { CalendarIcon } from 'lucide-react';
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
import { QUARTER_OPTIONS } from '@/lib/constants';

interface QuarterSelectorProps {
  value: string;
  onSelect: (value: string) => void;
  type?: 'inline' | 'dropdown';
  isIconEnabled?: boolean;
}

export const QuarterSelector = ({ value, onSelect, type = 'dropdown', isIconEnabled = true }: QuarterSelectorProps) => {
  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;
  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectComponent className="px-2" id="quarter">
        {isIconEnabled && <CalendarIcon className="w-4 h-4" />}
        <SelectValue placeholder="Select quarter" />
      </SelectComponent>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs font-medium">Quarter</SelectLabel>
          {QUARTER_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.value}>
              <span>{option.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
