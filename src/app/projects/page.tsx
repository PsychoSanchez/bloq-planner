import { Suspense } from 'react';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { ProjectsPageContent } from '@/components/projects-page-content';

// Main page component
export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <NewProjectDialog />
      </div>

      <Suspense fallback={<div className="text-center py-16 text-sm text-muted-foreground">Loading projects...</div>}>
        <ProjectsPageContent />
      </Suspense>
    </div>
  );
}
