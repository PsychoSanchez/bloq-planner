'use client';

import { useState, useEffect } from 'react';
import { ArchiveIcon, ArchiveRestoreIcon, ExternalLinkIcon } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { PRIORITY_OPTIONS, QUARTER_OPTIONS, PROJECT_AREAS } from '@/lib/constants';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RouterInput } from '@/utils/trpc';

type UpdateProjectInput = RouterInput['project']['patchProject'];

interface ProjectContextMenuProps {
  project: Project;
  teams: TeamOption[];
  onUpdateProject?: (updates: UpdateProjectInput) => Promise<void>;
  children: React.ReactNode;
}

export function ProjectContextMenu({ project, teams, onUpdateProject, children }: ProjectContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Project>>({});

  // Apply pending updates when context menu closes
  useEffect(() => {
    if (!isOpen && Object.keys(pendingUpdates).length > 0 && onUpdateProject) {
      onUpdateProject({ id: project.id, ...pendingUpdates });
      setPendingUpdates({});
    }
  }, [isOpen, pendingUpdates, onUpdateProject, project.id]);

  // Get current value considering pending updates
  const getCurrentValue = <T extends keyof Project>(key: T): Project[T] => {
    return pendingUpdates[key] !== undefined ? pendingUpdates[key] : project[key];
  };

  const updatePendingValue = <T extends keyof Project>(key: T, value: Project[T]) => {
    setPendingUpdates((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriorityChange = (priority: string) => {
    updatePendingValue('priority', priority as 'low' | 'medium' | 'high' | 'urgent');
  };

  const handleQuarterChange = (quarter: string) => {
    const currentQuarters = getCurrentValue('quarters') || [];
    const newQuarters = currentQuarters.includes(quarter)
      ? currentQuarters.filter((q) => q !== quarter)
      : [...currentQuarters, quarter];
    updatePendingValue('quarters', newQuarters);
  };

  const handleAreaChange = (area: string) => {
    updatePendingValue('area', area);
  };

  const handleLeadChange = (leadId: string) => {
    updatePendingValue('leadId', leadId || undefined);
  };

  const handleTeamChange = (teamIds: string[]) => {
    updatePendingValue('teamIds', teamIds);
  };

  const handleDependenciesChange = (dependencyIds: string[]) => {
    const dependencies = dependencyIds.map((teamId) => ({
      team: teamId,
      status: 'pending' as const,
      description: '',
    }));
    updatePendingValue('dependencies', dependencies);
  };

  const handleArchiveToggle = () => {
    updatePendingValue('archived', !getCurrentValue('archived'));
  };

  const handleTeamToggle = (teamId: string) => {
    const currentTeams = getCurrentValue('teamIds') || [];
    const newTeams = currentTeams.includes(teamId)
      ? currentTeams.filter((id) => id !== teamId)
      : [...currentTeams, teamId];
    handleTeamChange(newTeams);
  };

  const handleDependencyToggle = (teamId: string) => {
    const currentDependencies = getCurrentValue('dependencies')?.map((dep) => dep.team) || [];
    const newDependencies = currentDependencies.includes(teamId)
      ? currentDependencies.filter((id) => id !== teamId)
      : [...currentDependencies, teamId];
    handleDependenciesChange(newDependencies);
  };

  // Wrapper functions to prevent menu closing
  const handlePriorityClick = (e: React.MouseEvent, priority: string) => {
    e.preventDefault();
    e.stopPropagation();
    handlePriorityChange(priority);
  };

  const handleQuarterClick = (e: React.MouseEvent, quarter: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleQuarterChange(quarter);
  };

  const handleAreaClick = (e: React.MouseEvent, area: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleAreaChange(area);
  };

  const handleLeadClick = (e: React.MouseEvent, leadId: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleLeadChange(leadId);
  };

  const handleTeamToggleClick = (e: React.MouseEvent, teamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleTeamToggle(teamId);
  };

  const handleDependencyToggleClick = (e: React.MouseEvent, teamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleDependencyToggle(teamId);
  };

  const handleTeamClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleTeamChange([]);
  };

  const handleDependenciesClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDependenciesChange([]);
  };

  const handleAreaRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAreaChange('');
  };

  const handleLeadRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleLeadChange('');
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleArchiveToggle();
  };

  if (!onUpdateProject) {
    return <>{children}</>;
  }

  return (
    <ContextMenu onOpenChange={setIsOpen}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuLabel className="text-sm font-medium flex items-center gap-2 text-nowrap justify-between">
          <span className="truncate">{project.name}</span>
          <Link href={`/projects/${project.id}`} className="text-xs text-muted-foreground">
            <ExternalLinkIcon className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {/* Priority Section */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-baseline gap-2">
              Priority
              <span className="ml-auto text-xs text-muted-foreground">
                {PRIORITY_OPTIONS.find((p) => p.id === (getCurrentValue('priority') || 'medium'))?.name}
              </span>
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {PRIORITY_OPTIONS.map((priority) => (
              <ContextMenuItem
                key={priority.id}
                onClick={(e) => handlePriorityClick(e, priority.id)}
                className="flex items-center gap-2"
              >
                <priority.icon className={cn('h-4 w-4', priority.cn)} />
                <span className={cn('', priority.cn)}>{priority.name}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Quarter Section */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-baseline gap-2">
              Quarter
              <span className="ml-auto text-xs text-muted-foreground">
                {QUARTER_OPTIONS.find(
                  (q) =>
                    q.value ===
                    (getCurrentValue('quarters') && getCurrentValue('quarters')!.length > 0
                      ? getCurrentValue('quarters')![0]
                      : ''),
                )?.name || 'None'}
              </span>
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {QUARTER_OPTIONS.map((quarter) => (
              <ContextMenuCheckboxItem
                key={quarter.id}
                onClick={(e) => handleQuarterClick(e, quarter.value)}
                checked={getCurrentValue('quarters')?.includes(quarter.value)}
              >
                {quarter.name}
              </ContextMenuCheckboxItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Teams Section */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-baseline gap-2">
              Teams
              <span className="ml-auto text-xs text-muted-foreground">
                {getCurrentValue('teamIds') && getCurrentValue('teamIds')!.length > 0
                  ? `${getCurrentValue('teamIds')!.length} selected`
                  : 'None'}
              </span>
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleTeamClearClick} className="text-muted-foreground">
              Clear All Teams
            </ContextMenuItem>
            <ContextMenuSeparator />
            {teams
              .filter((team) => team.type === 'team')
              .map((team) => {
                const isSelected = getCurrentValue('teamIds')?.includes(team.id) || false;
                return (
                  <ContextMenuCheckboxItem
                    key={team.id}
                    onClick={(e) => handleTeamToggleClick(e, team.id)}
                    className="flex items-center gap-2"
                    checked={isSelected}
                  >
                    {team.name}
                  </ContextMenuCheckboxItem>
                );
              })}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Dependencies Section */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-baseline gap-2">
              Dependencies
              <span className="ml-auto text-xs text-muted-foreground">
                {getCurrentValue('dependencies') && getCurrentValue('dependencies')!.length > 0
                  ? `${getCurrentValue('dependencies')!.length} selected`
                  : 'None'}
              </span>
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleDependenciesClearClick} className="text-muted-foreground">
              Clear All Dependencies
            </ContextMenuItem>
            <ContextMenuSeparator />
            {teams.map((team) => {
              const isSelected = getCurrentValue('dependencies')?.some((dep) => dep.team === team.id) || false;
              return (
                <ContextMenuCheckboxItem
                  key={team.id}
                  onClick={(e) => handleDependencyToggleClick(e, team.id)}
                  className="flex items-center gap-2"
                  checked={isSelected}
                >
                  {team.name}
                </ContextMenuCheckboxItem>
              );
            })}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Area Section */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-baseline gap-2">
              Area
              <span className="ml-auto text-xs text-muted-foreground">
                {PROJECT_AREAS.find((a) => a.id === getCurrentValue('area'))?.name || 'None'}
              </span>
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleAreaRemoveClick} className="text-muted-foreground">
              Remove Area
            </ContextMenuItem>
            <ContextMenuSeparator />
            {PROJECT_AREAS.map((area) => (
              <ContextMenuCheckboxItem
                key={area.id}
                onClick={(e) => handleAreaClick(e, area.id)}
                className="flex items-center gap-2"
                checked={getCurrentValue('area') === area.id}
              >
                <area.icon className="h-4 w-4" />
                {area.name}
              </ContextMenuCheckboxItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Lead Section */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-baseline gap-2">
              Lead
              <span className="ml-auto text-xs text-muted-foreground">
                {teams.find((t) => t.id === getCurrentValue('leadId') && t.type === 'person')?.name || 'None'}
              </span>
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleLeadRemoveClick} className="text-muted-foreground">
              Remove Lead
            </ContextMenuItem>
            <ContextMenuSeparator />
            {teams
              .filter((t) => t.type === 'person')
              .map((person) => (
                <ContextMenuCheckboxItem
                  key={person.id}
                  onClick={(e) => handleLeadClick(e, person.id)}
                  checked={getCurrentValue('leadId') === person.id}
                >
                  {person.name}
                </ContextMenuCheckboxItem>
              ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Archive/Unarchive Action */}
        <ContextMenuItem onClick={handleArchiveClick} className="flex items-center gap-2">
          {getCurrentValue('archived') ? (
            <span className="flex items-center gap-2">
              <ArchiveRestoreIcon className="h-4 w-4" />
              Unarchive Project
            </span>
          ) : (
            <span className="flex items-center gap-2 text-destructive">
              <ArchiveIcon className="h-4 w-4 text-destructive" />
              Archive Project
            </span>
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
