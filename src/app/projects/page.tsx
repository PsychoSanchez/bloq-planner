import { Suspense } from 'react';
import { SearchProjects } from '@/components/search-projects';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { ProjectsList } from '@/components/projects-list';

// Main page component
export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Projects</h1>
        <NewProjectDialog />
      </div>

      <Suspense
        fallback={<div className="text-center py-4 text-sm text-muted-foreground">Loading search and filters...</div>}
      >
        <SearchProjects />
      </Suspense>

      <Suspense fallback={<div className="text-center py-16 text-sm text-muted-foreground">Loading projects...</div>}>
        <ProjectsList />
      </Suspense>
    </div>
  );
}
