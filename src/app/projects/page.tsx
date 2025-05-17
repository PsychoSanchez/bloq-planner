import { Suspense } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchProjects } from '@/components/search-projects';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { Project } from '@/lib/types';
import { ProjectModel } from '@/lib/models/project';
import { connectToDatabase } from '@/lib/mongodb';

// Server component for fetching and displaying projects
async function Projects({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  // If the database is not ready, use sample data in development
  let projects: Project[] = [];

  try {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (searchParams.type && searchParams.type !== 'all') {
      query.type = searchParams.type;
    }

    if (searchParams.search) {
      query.name = { $regex: searchParams.search, $options: 'i' };
    }

    const projectDocs = await ProjectModel.find(query).sort({ createdAt: -1 });
    projects = projectDocs.map((doc) => doc.toJSON()) as Project[];
  } catch (error) {
    console.error('Error fetching projects from database:', error);
    // In development, we can fall back to sample data if needed
    if (process.env.NODE_ENV === 'development') {
      const { getSampleData } = await import('@/lib/sample-data');
      projects = getSampleData().projects;
    }
  }

  return (
    <>
      {projects.length === 0 ? (
        <TableRow>
          <TableCell colSpan={7} className="h-16 text-center text-xs">
            No projects found.
          </TableCell>
        </TableRow>
      ) : (
        projects.map((project) => (
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
    </>
  );
}

// Main page component
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Projects</h1>
        <NewProjectDialog />
      </div>

      <SearchProjects />

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
            <Suspense
              fallback={
                <TableRow>
                  <TableCell colSpan={7} className="h-16 text-center">
                    Loading projects...
                  </TableCell>
                </TableRow>
              }
            >
              <Projects searchParams={await searchParams} />
            </Suspense>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
