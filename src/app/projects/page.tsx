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

      <SearchProjects />

      <ProjectsList />
    </div>
  );
}
