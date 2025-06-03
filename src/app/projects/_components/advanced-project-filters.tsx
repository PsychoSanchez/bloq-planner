'use client';

import { useCallback, useMemo } from 'react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarCheckboxItem,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { XIcon, SignalIcon, CalendarIcon, MapPinIcon, UserIcon, LinkIcon, FilterIcon, Users2Icon } from 'lucide-react';
import { PRIORITY_OPTIONS, QUARTER_OPTIONS, PROJECT_AREAS } from '@/lib/constants';
import { TeamOption } from '@/components/team-selector';

interface AdvancedProjectFiltersProps {
  teams: TeamOption[];
  teamsLoading: boolean;
}

const EMPTY_ARRAY = [] as string[];

export function AdvancedProjectFilters({ teams, teamsLoading }: AdvancedProjectFiltersProps) {
  // URL state for each filter dimension
  const [priorities, setPriorities] = useQueryState(
    'priorities',
    parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY),
  );
  const [quarters, setQuarters] = useQueryState('quarters', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [areas, setAreas] = useQueryState('areas', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [leads, setLeads] = useQueryState('leads', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [teamFilters, setTeamFilters] = useQueryState('teams', parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY));
  const [dependencies, setDependencies] = useQueryState(
    'dependencies',
    parseAsArrayOf(parseAsString).withDefault(EMPTY_ARRAY),
  );

  // Calculate total active filters
  const activeFiltersCount =
    priorities.length + quarters.length + areas.length + leads.length + teamFilters.length + dependencies.length;

  // Toggle functions for each filter type
  const togglePriority = useCallback(
    (priority: string) => {
      setPriorities((prev) => (prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]));
    },
    [setPriorities],
  );

  const toggleQuarter = useCallback(
    (quarter: string) => {
      setQuarters((prev) => (prev.includes(quarter) ? prev.filter((q) => q !== quarter) : [...prev, quarter]));
    },
    [setQuarters],
  );

  const toggleArea = useCallback(
    (area: string) => {
      setAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
    },
    [setAreas],
  );

  const toggleLead = useCallback(
    (lead: string) => {
      setLeads((prev) => (prev.includes(lead) ? prev.filter((l) => l !== lead) : [...prev, lead]));
    },
    [setLeads],
  );

  const toggleTeam = useCallback(
    (team: string) => {
      setTeamFilters((prev) => (prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]));
    },
    [setTeamFilters],
  );

  const toggleDependency = useCallback(
    (dependency: string) => {
      setDependencies((prev) =>
        prev.includes(dependency) ? prev.filter((d) => d !== dependency) : [...prev, dependency],
      );
    },
    [setDependencies],
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setPriorities([]);
    setQuarters([]);
    setAreas([]);
    setLeads([]);
    setTeamFilters([]);
    setDependencies([]);
  }, [setPriorities, setQuarters, setAreas, setLeads, setTeamFilters, setDependencies]);

  // Remove specific filter
  const removeFilter = useCallback(
    (type: string, value: string) => {
      switch (type) {
        case 'priority':
          togglePriority(value);
          break;
        case 'quarter':
          toggleQuarter(value);
          break;
        case 'area':
          toggleArea(value);
          break;
        case 'lead':
          toggleLead(value);
          break;
        case 'team':
          toggleTeam(value);
          break;
        case 'dependency':
          toggleDependency(value);
          break;
      }
    },
    [togglePriority, toggleQuarter, toggleArea, toggleLead, toggleTeam, toggleDependency],
  );

  // Get display names for filter values
  const getDisplayName = useCallback(
    (type: string, value: string) => {
      switch (type) {
        case 'priority':
          return PRIORITY_OPTIONS.find((p) => p.id === value)?.name || value;
        case 'quarter':
          return QUARTER_OPTIONS.find((q) => q.value === value)?.name || value;
        case 'area':
          return PROJECT_AREAS.find((a) => a.id === value)?.name || value;
        case 'lead':
          return teams.find((t) => t.id === value)?.name || value;
        case 'team':
          return teams.find((t) => t.id === value)?.name || value;
        case 'dependency':
          return teams.find((t) => t.id === value)?.name || value;
        default:
          return value;
      }
    },
    [teams],
  );

  // Available leads (filter out non-person types for leads)
  const availableLeads = useMemo(() => teams.filter((team) => team.type === 'person'), [teams]);

  // Available teams (filter out non-team types for team filtering)
  const availableTeams = useMemo(() => teams.filter((team) => team.type === 'team'), [teams]);

  // Available dependencies (include all types for dependency filtering)
  const availableDependencies = useMemo(() => teams, [teams]);

  return (
    <div className="space-y-3">
      {/* Filter Menu Bar */}
      <div className="flex items-center gap-3">
        <Menubar className="pl-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          {/* Priority Filter */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-2">
              <SignalIcon className="h-4 w-4" />
              <span className="text-sm">Priority</span>
            </MenubarTrigger>
            <MenubarContent>
              {PRIORITY_OPTIONS.map((priority) => (
                <MenubarCheckboxItem
                  key={priority.id}
                  className="flex items-center gap-2"
                  checked={priorities.includes(priority.id)}
                  onCheckedChange={() => togglePriority(priority.id)}
                >
                  <priority.icon className={`h-4 w-4 ${priority.cn}`} />
                  <span className={priority.cn}>{priority.name}</span>
                </MenubarCheckboxItem>
              ))}
            </MenubarContent>
          </MenubarMenu>

          {/* Quarter Filter */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">Quarter</span>
            </MenubarTrigger>
            <MenubarContent className="max-h-80 overflow-y-auto">
              {QUARTER_OPTIONS.map((quarter) => (
                <MenubarCheckboxItem
                  key={quarter.id}
                  checked={quarters.includes(quarter.value)}
                  onCheckedChange={() => toggleQuarter(quarter.value)}
                >
                  {quarter.name}
                </MenubarCheckboxItem>
              ))}
            </MenubarContent>
          </MenubarMenu>

          {/* Area Filter */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm">Area</span>
            </MenubarTrigger>
            <MenubarContent>
              {PROJECT_AREAS.map((area) => (
                <MenubarCheckboxItem
                  key={area.id}
                  className="flex items-center gap-2"
                  checked={areas.includes(area.id)}
                  onCheckedChange={() => toggleArea(area.id)}
                >
                  <area.icon className="h-4 w-4" />
                  {area.name}
                </MenubarCheckboxItem>
              ))}
            </MenubarContent>
          </MenubarMenu>

          {/* Lead Filter */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-2" disabled={teamsLoading}>
              <UserIcon className="h-4 w-4" />
              <span className="text-sm">Lead</span>
            </MenubarTrigger>
            <MenubarContent className="max-h-80 overflow-y-auto">
              {teamsLoading ? (
                <MenubarItem disabled>Loading...</MenubarItem>
              ) : availableLeads.length === 0 ? (
                <MenubarItem disabled>No leads available</MenubarItem>
              ) : (
                availableLeads.map((lead) => (
                  <MenubarCheckboxItem
                    key={lead.id}
                    checked={leads.includes(lead.id)}
                    onCheckedChange={() => toggleLead(lead.id)}
                  >
                    {lead.name}
                  </MenubarCheckboxItem>
                ))
              )}
            </MenubarContent>
          </MenubarMenu>

          {/* Team Filter */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-2" disabled={teamsLoading}>
              <Users2Icon className="h-4 w-4" />
              <span className="text-sm">Team</span>
            </MenubarTrigger>
            <MenubarContent className="max-h-80 overflow-y-auto">
              {teamsLoading ? (
                <MenubarItem disabled>Loading...</MenubarItem>
              ) : availableTeams.length === 0 ? (
                <MenubarItem disabled>No teams available</MenubarItem>
              ) : (
                availableTeams.map((team) => (
                  <MenubarCheckboxItem
                    key={team.id}
                    checked={teamFilters.includes(team.id)}
                    onCheckedChange={() => toggleTeam(team.id)}
                  >
                    {team.name}
                  </MenubarCheckboxItem>
                ))
              )}
            </MenubarContent>
          </MenubarMenu>

          {/* Dependency Filter */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-2" disabled={teamsLoading}>
              <LinkIcon className="h-4 w-4" />
              <span className="text-sm">Dependencies</span>
            </MenubarTrigger>
            <MenubarContent className="max-h-80 overflow-y-auto">
              {teamsLoading ? (
                <MenubarItem disabled>Loading...</MenubarItem>
              ) : availableDependencies.length === 0 ? (
                <MenubarItem disabled>No dependencies available</MenubarItem>
              ) : (
                availableDependencies.map((team) => (
                  <MenubarCheckboxItem
                    key={team.id}
                    checked={dependencies.includes(team.id)}
                    onCheckedChange={() => toggleDependency(team.id)}
                  >
                    {team.name}
                  </MenubarCheckboxItem>
                ))
              )}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        {/* Clear All Filters Button */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 px-3 gap-2 text-muted-foreground">
            <XIcon className="h-4 w-4" />
            <span className="text-sm">Clear all</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {priorities.map((priority) => (
            <Badge key={`priority-${priority}`} variant="secondary" className="gap-1">
              Priority: {getDisplayName('priority', priority)}
              <button
                onClick={() => removeFilter('priority', priority)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {quarters.map((quarter) => (
            <Badge key={`quarter-${quarter}`} variant="secondary" className="gap-1">
              Quarter: {getDisplayName('quarter', quarter)}
              <button
                onClick={() => removeFilter('quarter', quarter)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {areas.map((area) => (
            <Badge key={`area-${area}`} variant="secondary" className="gap-1">
              Area: {getDisplayName('area', area)}
              <button
                onClick={() => removeFilter('area', area)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {leads.map((lead) => (
            <Badge key={`lead-${lead}`} variant="secondary" className="gap-1">
              Lead: {getDisplayName('lead', lead)}
              <button
                onClick={() => removeFilter('lead', lead)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {teamFilters.map((team) => (
            <Badge key={`team-${team}`} variant="secondary" className="gap-1">
              Team: {getDisplayName('team', team)}
              <button
                onClick={() => removeFilter('team', team)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {dependencies.map((dependency) => (
            <Badge key={`dependency-${dependency}`} variant="secondary" className="gap-1">
              Dependency: {getDisplayName('dependency', dependency)}
              <button
                onClick={() => removeFilter('dependency', dependency)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
