import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { fromProjectDocument, ProjectModel } from '@/lib/models/project';
import { Project } from '@/lib/types';
import { ProjectView } from '@/components/project-view';

// Get project data
async function getProjectData(id: string): Promise<Project | null> {
  try {
    await connectToDatabase();
    const project = await ProjectModel.findById(id);
    if (!project) return null;

    return fromProjectDocument(project);
  } catch (error) {
    console.error('Error fetching project data:', error);

    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const project = await getProjectData((await params).id);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <ProjectView project={project} />
    </div>
  );
}
