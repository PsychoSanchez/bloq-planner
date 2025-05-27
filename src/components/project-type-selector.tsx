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
import { Project } from '@/lib/types';
import { PROJECT_TYPE_OPTIONS } from '@/lib/constants';
import { FileIcon } from 'lucide-react';

interface ProjectTypeSelectorProps {
  value: Project['type'];
  onSelect: (value: Project['type']) => void;
  type?: 'inline' | 'dropdown';
  placeholder?: string;
}

export const ProjectTypeSelector = ({
  value,
  onSelect,
  type = 'dropdown',
  placeholder = 'Select type',
}: ProjectTypeSelectorProps) => {
  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectComponent className="px-2" id="project-type">
        <FileIcon className="w-4 h-4" />
        <SelectValue placeholder={placeholder} />
      </SelectComponent>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Project Types</SelectLabel>
          {PROJECT_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <span>{option.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
