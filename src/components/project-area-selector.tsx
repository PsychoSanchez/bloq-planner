import { PROJECT_AREAS } from '@/lib/constants';
import {
  InlineSelectTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ProjectAreaSelectorProps {
  type?: 'inline' | 'dropdown';
  value: string;
  onSelect: (value: string) => void;
}

export const ProjectAreaSelector = ({ value, onSelect, type = 'dropdown' }: ProjectAreaSelectorProps) => {
  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectComponent className="px-2" id="area">
        <SelectValue placeholder="Select area" />
      </SelectComponent>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Project Area</SelectLabel>
          {PROJECT_AREAS.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              <area.icon />
              <span>{area.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
