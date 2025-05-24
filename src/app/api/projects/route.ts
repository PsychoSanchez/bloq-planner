import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProjectModel, fromProjectDocument } from '@/lib/models/project';
import { type } from 'arktype';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const quarter = searchParams.get('quarter');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const query: Record<string, unknown> = {};

    // By default, only show non-archived projects unless specifically requested
    if (!includeArchived) {
      query.archived = { $ne: true };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (quarter) {
      query.quarter = quarter;
    }

    const projectDocs = await ProjectModel.find(query).sort({ createdAt: -1 });
    const projects = projectDocs.map(fromProjectDocument);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects', projects: [] }, { status: 500 });
  }
}

const CreateProjectRequestBody = type({
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
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const sanitizedBody = CreateProjectRequestBody(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Validation error', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    const newProject = await ProjectModel.create(sanitizedBody);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
