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
  // Filter teams to only show persons and group by role
  const personsByRole = useMemo(() => {
    const persons = teams.filter((team) => team.type === 'person');
    return persons.reduce(
      (acc, person) => {
        acc[person.role] ??= [];
        acc[person.role]!.push(person);
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
          <SelectValue placeholder="Loading teams..." />
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
        {Object.entries(personsByRole).map(([role, rolePersons]) => (
          <SelectGroup key={role}>
            <SelectLabel className="capitalize">{role}</SelectLabel>
            {rolePersons.map((person) => (
              <SelectItem key={person.id} value={person.id} className="text-xs">
                <div className="flex items-center justify-between w-full">
                  <span>{person.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {Object.keys(personsByRole).length === 0 && (
          <SelectItem value="__no_persons_available__" disabled>
            No persons available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
