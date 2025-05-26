'use client';

import { useMemo } from 'react';
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
import { UserIcon } from 'lucide-react';
import { TeamOption } from '@/components/team-selector';

interface PersonSelectorProps {
  value?: string;
  onSelect: (personId: string) => void;
  placeholder?: string;
  className?: string;
  teams: TeamOption[];
  loading?: boolean;
  type?: 'inline' | 'dropdown';
}

export function PersonSelector({
  value,
  onSelect,
  placeholder = 'Select person...',
  className,
  teams,
  loading = false,
  type = 'dropdown',
}: PersonSelectorProps) {
  // Filter teams to only show persons and group by department
  const personsByDepartment = useMemo(() => {
    const persons = teams.filter((team) => team.type === 'person');
    return persons.reduce(
      (acc, person) => {
        acc[person.department] ??= [];
        acc[person.department]!.push(person);
        return acc;
      },
      {} as Record<string, TeamOption[]>,
    );
  }, [teams]);

  const selectedPerson = teams.find((team) => team.id === value && team.type === 'person');
  const displayValue = selectedPerson ? selectedPerson.name : value;

  if (loading) {
    return (
      <Select disabled>
        <InlineSelectTrigger className={className}>
          <SelectValue placeholder="Loading persons..." />
        </InlineSelectTrigger>
      </Select>
    );
  }

  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectComponent className={className}>
        <SelectValue placeholder={placeholder}>
          <UserIcon className="w-4 h-4" />
          {displayValue || placeholder}
        </SelectValue>
      </SelectComponent>
      <SelectContent>
        {Object.entries(personsByDepartment).map(([department, departmentPersons]) => (
          <SelectGroup key={department}>
            <SelectLabel className="capitalize">{department}</SelectLabel>
            {departmentPersons.map((person) => (
              <SelectItem key={person.id} value={person.id} className="text-xs">
                <div className="flex items-center justify-between w-full">
                  <span>{person.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {Object.keys(personsByDepartment).length === 0 && (
          <SelectItem value="" disabled>
            No persons available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
