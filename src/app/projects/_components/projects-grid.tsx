'use client';

import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { ProjectCard } from '@/app/projects/_components/project-card';
import { Project } from '@/lib/types';
import { ProjectGroup } from '@/lib/utils/group-projects';
import { useState, useEffect } from 'react';
import { TeamOption } from '@/components/team-selector';
import { ProjectDetailsSheet } from '@/components/project-details-sheet';
import { GroupByOption } from '@/app/projects/_components/project-group-selector';
import { PROJECT_AREAS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface ProjectsGridProps {
  groups: ProjectGroup[];
  isGrouped: boolean;
  groupBy?: GroupByOption;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  teams: TeamOption[];
  teamsLoading: boolean;
}

export function ProjectsGrid({ groups, isGrouped, groupBy, onUpdateProject, teams, teamsLoading }: ProjectsGridProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map((g) => g.label)));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Derive the current project from the projects array to ensure we always have fresh data
  const selectedProject = selectedProjectId
    ? groups.flatMap((g) => g.projects).find((p) => p.id === selectedProjectId) || null
    : null;

  // Function to get area icon for group headers
  const getAreaIcon = (groupLabel: string) => {
    if (groupBy !== 'area' || groupLabel === 'No Area') return null;

    // Find the area by name (since the label is now formatted)
    const area = PROJECT_AREAS.find((a) => a.name === groupLabel);
    return area ? area.icon : null;
  };

  // Ensure new groups are automatically expanded
  useEffect(() => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev);
      groups.forEach((group) => {
        if (!newExpanded.has(group.label)) {
          newExpanded.add(group.label);
        }
      });
      return newExpanded;
    });
  }, [groups]);

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedProjectId(null);
  };

  if (!isGrouped) {
    // Render normal grid without grouping
    const allProjects = groups[0]?.projects || [];
    return (
      <>
        {allProjects.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No projects found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allProjects.map((project) => (
              <ProjectCard key={project.id} project={project} teams={teams} teamsLoading={teamsLoading} />
            ))}
          </div>
        )}
        <ProjectDetailsSheet
          project={selectedProject}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onUpdateProject={onUpdateProject}
          teams={teams}
          teamsLoading={teamsLoading}
        />
      </>
    );
  }

  // Render grouped grid
  return (
    <>
      <div className="space-y-6">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          const AreaIcon = getAreaIcon(group.label);

          return (
            <div key={group.label} className="space-y-3">
              {/* Group Header */}
              <Button
                variant="ghost"
                onClick={() => toggleGroup(group.label)}
                className="w-full justify-start p-3 h-auto bg-muted/50 hover:bg-muted/70 rounded-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  {AreaIcon && <AreaIcon className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium text-sm">{group.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {group.projects.length} project{group.projects.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Button>

              {/* Group Content */}
              {isExpanded && (
                <div className="pl-4">
                  {group.projects.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">No projects in this group.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.projects.map((project) => (
                        <ProjectCard key={project.id} project={project} teams={teams} teamsLoading={teamsLoading} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ProjectDetailsSheet
        project={selectedProject}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onUpdateProject={onUpdateProject}
        teams={teams}
        teamsLoading={teamsLoading}
      />
    </>
  );
}
