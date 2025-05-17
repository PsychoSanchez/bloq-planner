'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { Separator } from '@/components/ui/separator';
import { EditProjectForm } from '@/components/edit-project-form';
import { Project } from '@/lib/types';

interface ProjectViewProps {
  project: Project;
}

export function ProjectView({ project }: ProjectViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditProjectForm project={project} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <ProjectTypeBadge type={project.type} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p>{project.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              {project.dependencies && project.dependencies.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {project.dependencies.map((dep) => (
                    <li key={dep.team}>{dep.team}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">No dependencies</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Priority</p>
                <PriorityBadge priority={project.priority || 'medium'} />
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Team</p>
                <p>{project.teamId || 'No team assigned'}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lead</p>
                <p>{project.leadId || 'No lead assigned'}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Area</p>
                <p>{project.area || 'Not specified'}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  <span>{project.createdAt ? format(new Date(project.createdAt), 'PPP') : 'Unknown date'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Team members assigned to this project</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">No assignments yet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
