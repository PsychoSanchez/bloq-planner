'use client';

import { useState } from 'react';
import { getSampleData } from '@/lib/sample-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { SearchIcon, FilterIcon } from 'lucide-react';

export default function ProjectsPage() {
  const { projects } = getSampleData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter projects based on search query and type filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Projects</h1>
        <NewProjectDialog />
      </div>

      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="h-8 w-full pl-7 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all" onValueChange={(value) => setTypeFilter(value)}>
          <SelectTrigger className="h-8 w-[130px] text-xs gap-1">
            <FilterIcon className="h-3.5 w-3.5" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-xs">Project Types</SelectLabel>
              <SelectItem value="all" className="text-xs py-1">
                All Types
              </SelectItem>
              <SelectItem value="regular" className="text-xs py-1">
                Regular
              </SelectItem>
              <SelectItem value="tech-debt" className="text-xs py-1">
                Tech Debt
              </SelectItem>
              <SelectItem value="team-event" className="text-xs py-1">
                Team Event
              </SelectItem>
              <SelectItem value="spillover" className="text-xs py-1">
                Spillover
              </SelectItem>
              <SelectItem value="blocked" className="text-xs py-1">
                Blocked
              </SelectItem>
              <SelectItem value="hack" className="text-xs py-1">
                Hack
              </SelectItem>
              <SelectItem value="sick-leave" className="text-xs py-1">
                Sick Leave
              </SelectItem>
              <SelectItem value="vacation" className="text-xs py-1">
                Vacation
              </SelectItem>
              <SelectItem value="onboarding" className="text-xs py-1">
                Onboarding
              </SelectItem>
              <SelectItem value="duty" className="text-xs py-1">
                Team Duty
              </SelectItem>
              <SelectItem value="risky-week" className="text-xs py-1">
                Risk Alert
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-sm border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 w-[200px]">Name</TableHead>
              <TableHead className="py-1 px-2">Type</TableHead>
              <TableHead className="py-1 px-2">Team</TableHead>
              <TableHead className="py-1 px-2">Lead</TableHead>
              <TableHead className="py-1 px-2">Priority</TableHead>
              <TableHead className="py-1 px-2">Dependencies</TableHead>
              <TableHead className="py-1 px-2">Area</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-16 text-center text-xs">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="h-8 cursor-pointer hover:bg-muted/50">
                  <TableCell className="py-1 px-2 font-medium">{project.name}</TableCell>
                  <TableCell className="py-1 px-2">
                    <ProjectTypeBadge type={project.type} />
                  </TableCell>
                  <TableCell className="py-1 px-2">PSY</TableCell>
                  <TableCell className="py-1 px-2">No lead</TableCell>
                  <TableCell className="py-1 px-2">
                    <PriorityBadge priority="medium" />
                  </TableCell>
                  <TableCell className="py-1 px-2">--</TableCell>
                  <TableCell className="py-1 px-2">Frontend</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
