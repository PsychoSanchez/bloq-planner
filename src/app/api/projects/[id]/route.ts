import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProjectModel } from '@/lib/models/project';
import { type } from 'arktype';

// GET a single project by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const project = await ProjectModel.findById((await params).id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

const UpdateProjectRequestBody = type({
  name: 'string < 255',
  slug: 'string < 32',
  type: 'string < 32',
  'quarter?': 'string < 7',
  'color?': 'string < 32',
  'description?': 'string < 2000',
  'priority?': "'low' | 'medium' | 'high' | 'urgent'",
  'teamId?': 'string < 100',
  'leadId?': 'string < 100',
  'area?': 'string < 100',
  'archived?': 'boolean',
});

// UPDATE a project by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const sanitizedBody = UpdateProjectRequestBody(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Validation error', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      (await params).id,
      { $set: sanitizedBody },
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE a project by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const deletedProject = await ProjectModel.findByIdAndDelete((await params).id);

    if (!deletedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

const PatchProjectRequestBody = type({
  'name?': 'string < 255',
  'slug?': 'string < 32',
  'type?': 'string < 32',
  'color?': 'string < 32',
  'quarter?': 'string < 7',
  'description?': 'string < 2000',
  'priority?': "'low' | 'medium' | 'high' | 'urgent'",
  'teamId?': 'string < 100',
  'leadId?': 'string < 100',
  'area?': 'string < 100',
  'archived?': 'boolean',
  'dependencies?': 'unknown', // This is transformed in the code
  'estimates?': 'unknown', // This is complex and handled separately
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sanitizedBody = PatchProjectRequestBody(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Validation error', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    await connectToDatabase();

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      id,
      { $set: sanitizedBody },
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject.toJSON());
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
