import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProjectModel } from '@/lib/models/project';
import { type } from 'arktype';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build query object
    const query: Record<string, unknown> = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await ProjectModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

const CreateProjectRequestBody = type({
  name: 'string < 255',
  slug: 'string < 32',
  type: 'string < 32',
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
