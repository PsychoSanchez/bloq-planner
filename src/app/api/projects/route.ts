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

    // New multidimensional filters
    const priorities = searchParams.get('priorities')?.split(',').filter(Boolean) || [];
    const quarters = searchParams.get('quarters')?.split(',').filter(Boolean) || [];
    const areas = searchParams.get('areas')?.split(',').filter(Boolean) || [];
    const leads = searchParams.get('leads')?.split(',').filter(Boolean) || [];

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

    // Legacy single quarter filter (for backward compatibility)
    if (quarter) {
      query.quarter = quarter;
    }

    // New multidimensional filters using $in operator for OR logic within each dimension
    if (priorities.length > 0) {
      query.priority = { $in: priorities };
    }

    if (quarters.length > 0) {
      // If both legacy quarter and new quarters are provided, use the new one
      if (!quarter) {
        query.quarter = { $in: quarters };
      }
    }

    if (areas.length > 0) {
      query.area = { $in: areas };
    }

    if (leads.length > 0) {
      query.leadId = { $in: leads };
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
  'dependencies?': 'unknown[]',
  'cost?': 'number | string',
  'impact?': 'number | string',
  'roi?': 'number | string',
  'estimates?': 'unknown',
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
