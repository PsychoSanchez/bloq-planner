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

export interface TeamOption {
  id: string;
  name: string;
  department: string;
  type: 'person' | 'team' | 'dependency' | 'event';
}

interface TeamSelectorProps {
  value?: string;
  onSelect: (teamId: string) => void;
  placeholder?: string;
  className?: string;
  teams: TeamOption[];
  loading?: boolean;
  type?: 'inline' | 'dropdown';
}

export function TeamSelector({
  value,
  onSelect,
  placeholder = 'Select team...',
  className,
  teams,
  loading = false,
  type = 'dropdown',
}: TeamSelectorProps) {
  // Group teams by department
  const teamsByDepartment = useMemo(() => {
    return teams.reduce(
      (acc, team) => {
        acc[team.department] ??= [];
        acc[team.department]!.push(team);
        return acc;
      },
      {} as Record<string, TeamOption[]>,
    );
  }, [teams]);

  const selectedTeam = teams.find((team) => team.id === value);
  const displayValue = selectedTeam ? selectedTeam.name : value;

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
        {Object.entries(teamsByDepartment).map(([department, departmentTeams]) => (
          <SelectGroup key={department}>
            <SelectLabel className="capitalize">{department}</SelectLabel>
            {departmentTeams.map((team) => (
              <SelectItem key={team.id} value={team.id} className="text-xs">
                <div className="flex items-center justify-between w-full">
                  <span>{team.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{team.type === 'team' ? 'Team' : 'Person'}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {teams.length === 0 && (
          <SelectItem value="" disabled>
            No teams available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
