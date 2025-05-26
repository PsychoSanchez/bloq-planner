'use client';

import { useCallback, useMemo } from 'react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { XIcon, SignalIcon, CalendarIcon, MapPinIcon, UserIcon } from 'lucide-react';
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

  // Calculate total active filters
  const activeFiltersCount = priorities.length + quarters.length + areas.length + leads.length;

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

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setPriorities([]);
    setQuarters([]);
    setAreas([]);
    setLeads([]);
  }, [setPriorities, setQuarters, setAreas, setLeads]);

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
      }
    },
    [togglePriority, toggleQuarter, toggleArea, toggleLead],
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
        default:
          return value;
      }
    },
    [teams],
  );

  // Available leads (filter out non-person types for leads)
  const availableLeads = useMemo(() => teams.filter((team) => team.type === 'person'), [teams]);

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="h-9 px-3 gap-2">
              <SignalIcon className="h-4 w-4" />
              <span className="text-sm">Priority</span>
              {priorities.length > 0 && <span className="text-xs text-muted-foreground">({priorities.length})</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuLabel className="text-xs">Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRIORITY_OPTIONS.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.id}
                className="text-xs flex items-center gap-2"
                checked={priorities.includes(priority.id)}
                onCheckedChange={() => togglePriority(priority.id)}
              >
                <priority.icon className={`h-4 w-4 ${priority.cn}`} />
                <span className={priority.cn}>{priority.name}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quarter Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="h-9 px-3 gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">Quarter</span>
              {quarters.length > 0 && <span className="text-xs text-muted-foreground">({quarters.length})</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32 max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-xs">Filter by Quarter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {QUARTER_OPTIONS.map((quarter) => (
              <DropdownMenuCheckboxItem
                key={quarter.id}
                className="text-xs"
                checked={quarters.includes(quarter.value)}
                onCheckedChange={() => toggleQuarter(quarter.value)}
              >
                {quarter.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Area Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="h-9 px-3 gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm">Area</span>
              {areas.length > 0 && <span className="text-xs text-muted-foreground">({areas.length})</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel className="text-xs">Filter by Area</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PROJECT_AREAS.map((area) => (
              <DropdownMenuCheckboxItem
                key={area.id}
                className="text-xs flex items-center gap-2"
                checked={areas.includes(area.id)}
                onCheckedChange={() => toggleArea(area.id)}
              >
                <area.icon className="h-4 w-4" />
                {area.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Lead Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="h-9 px-3 gap-2" disabled={teamsLoading}>
              <UserIcon className="h-4 w-4" />
              <span className="text-sm">Lead</span>
              {leads.length > 0 && <span className="text-xs text-muted-foreground">({leads.length})</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-xs">Filter by Lead</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teamsLoading ? (
              <div className="p-2 text-xs text-muted-foreground">Loading...</div>
            ) : availableLeads.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground">No leads available</div>
            ) : (
              availableLeads.map((lead) => (
                <DropdownMenuCheckboxItem
                  key={lead.id}
                  className="text-xs"
                  checked={leads.includes(lead.id)}
                  onCheckedChange={() => toggleLead(lead.id)}
                >
                  {lead.name}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear All Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="default"
            onClick={clearAllFilters}
            className="h-9 px-3 gap-2 text-muted-foreground"
          >
            <XIcon className="h-4 w-4" />
            <span className="text-sm">Clear all</span>
            <span className="text-xs text-muted-foreground">({activeFiltersCount})</span>
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
        </div>
      )}
    </div>
  );
}
