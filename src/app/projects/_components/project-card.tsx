'use client';

import Link from 'next/link';
import { ExternalLinkIcon, TrendingUpIcon, CalendarIcon, UsersIcon, UserIcon, LinkIcon } from 'lucide-react';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { TeamOption } from '@/components/team-selector';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';
import { PROJECT_AREAS, PRIORITY_OPTIONS } from '@/lib/constants';

interface ProjectCardProps {
  project: Project;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function ProjectCard({ project, teams }: ProjectCardProps) {
  const calculateROI = () => {
    const cost = typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost;
    const impact = typeof project.impact === 'string' ? parseFloat(project.impact) : project.impact;

    if (!cost || !impact || cost === 0) return null;
    return Math.round(((impact - cost) / cost) * 100);
  };

  const roi = calculateROI();

  // Get project color
  const projectColor = getProjectColorByName(project.color) || getDefaultProjectColor();
  const colorHex = projectColor.hex;

  // Get area icon
  const areaData = PROJECT_AREAS.find((area) => area.id === project.area);
  const AreaIcon = areaData?.icon;

  // Get priority data
  const priorityData = PRIORITY_OPTIONS.find((p) => p.id === (project.priority || 'medium'));
  const PriorityIcon = priorityData?.icon;

  // Get team names
  const teamNames =
    project.teamIds
      ?.map((teamId) => {
        const team = teams.find((t) => t.id === teamId);
        return team?.name || teamId;
      })
      .slice(0, 1) || []; // Only show 1 team to save space

  // Get lead name - find person with matching ID
  const leadName = project.leadId
    ? (() => {
        const lead = teams.find((member) => member.id === project.leadId && member.type === 'person');
        return lead?.name || 'Unknown';
      })()
    : null;

  return (
    <div
      className={cn(
        'group relative border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-32',
        project.archived && 'opacity-60',
      )}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${colorHex} 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <Link href={`/projects/${project.id}`} className="relative h-full p-2 flex flex-col">
        {/* Header with area icon and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {AreaIcon && (
              <div className="flex-shrink-0">
                <AreaIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-tight group-hover/title:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
            </div>
            <ExternalLinkIcon className="h-2.5 w-2.5" />
          </div>
        </div>

        {/* Project type and priority badges */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <ProjectTypeBadge type={project.type} />
          {PriorityIcon && (
            <div className="flex items-center gap-0.5">
              <PriorityIcon className={cn('h-2.5 w-2.5', priorityData?.cn)} />
              <span className={cn('text-xs', priorityData?.cn)}>{priorityData?.name}</span>
            </div>
          )}
          {roi !== null && (
            <Badge
              variant="outline"
              className={cn('text-xs px-1 py-0 h-4', roi > 0 ? 'text-green-600' : 'text-red-600')}
            >
              <TrendingUpIcon className="h-2.5 w-2.5 mr-0.5" />
              {roi > 0 ? '+' : ''}
              {roi}%
            </Badge>
          )}
        </div>

        {/* Bottom section with metadata */}
        <div className="mt-auto space-y-0.5">
          {/* Timeline and Area */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {project.quarters && project.quarters.length > 0 && (
              <div className="flex items-center gap-0.5">
                <CalendarIcon className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">
                  {project.quarters.length === 1
                    ? project.quarters[0]
                    : `${project.quarters[0]} +${project.quarters.length - 1}`}
                </span>
              </div>
            )}
            {areaData && <span className="truncate">{areaData.name}</span>}
          </div>

          {/* Team and Lead */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {teamNames.length > 0 && (
              <div className="flex items-center gap-0.5 min-w-0">
                <UsersIcon className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">{teamNames[0]}</span>
              </div>
            )}
            {leadName && (
              <div className="flex items-center gap-0.5 min-w-0">
                <UserIcon className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">{leadName}</span>
              </div>
            )}
            {project.dependencies && project.dependencies.length > 0 && (
              <div className="flex items-center gap-0.5">
                <LinkIcon className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{project.dependencies.length}</span>
              </div>
            )}
          </div>

          {/* Business impact */}
          {project.cost || project.impact ? (
            <div className="flex items-center gap-1.5 text-xs">
              {project.cost && (
                <span className="text-muted-foreground truncate">
                  Cost:{' '}
                  <span className="text-foreground font-medium">
                    €{typeof project.cost === 'string' ? project.cost : project.cost.toLocaleString()}
                  </span>
                </span>
              )}
              {project.impact && (
                <span className="text-muted-foreground truncate">
                  Impact:{' '}
                  <span className="text-foreground font-medium">
                    €{typeof project.impact === 'string' ? project.impact : project.impact.toLocaleString()}
                  </span>
                </span>
              )}
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
