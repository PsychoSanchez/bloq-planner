import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { ProjectModel } from '@/lib/models/project';
import { Project } from '@/lib/types';
import { ProjectView } from '@/components/project-view';

// Get project data
async function getProjectData(id: string): Promise<Project | null> {
  try {
    await connectToDatabase();
    const project = await ProjectModel.findById(id);
    if (!project) return null;
    return project.toJSON() as Project;
  } catch (error) {
    console.error('Error fetching project data:', error);
    // In development, we can use sample data if needed
    if (process.env.NODE_ENV === 'development') {
      const { getSampleData } = await import('@/lib/sample-data');
      const sampleProject = getSampleData().projects.find((p) => p.id === id);
      return sampleProject || null;
    }
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProjectData(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <ProjectView project={project} />
    </div>
  );
}
