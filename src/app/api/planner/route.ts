import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PlannerModel } from '@/lib/models/planner';
import { Planner } from '@/lib/types';
import { type } from 'arktype';
import { fromTeamMemberDocument } from '@/lib/models/team-member';
import { fromProjectDocument } from '@/lib/models/project';
import { DEFAULT_PROJECTS } from '@/lib/constants/default-projects';

export async function GET() {
  try {
    await connectToDatabase();
    const planners = await PlannerModel.find().populate('assignees').populate('projects').lean();

    // Transform MongoDB documents to match Planner interface
    const formattedPlanners: Planner[] = planners.map((planner) => ({
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees.map(fromTeamMemberDocument) || [],
      // Always include default projects in every planner
      projects: [...(planner.projects.map(fromProjectDocument) || []), ...DEFAULT_PROJECTS],
    }));

    return NextResponse.json(formattedPlanners);
  } catch (error) {
    console.error('Failed to fetch planners:', error);
    return NextResponse.json({ error: 'Failed to fetch planners' }, { status: 500 });
  }
}

const CreatePlannerRequest = type({
  name: 'string',
  assignees: 'string[]',
  projects: 'string[]',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitizedBody = CreatePlannerRequest(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Invalid request data', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    await connectToDatabase();

    // Separate regular projects from default projects
    const regularProjectIds = sanitizedBody.projects.filter((projectId) => !projectId.startsWith('default-'));

    // Only store regular project IDs in the database
    const newPlanner = new PlannerModel({
      name: sanitizedBody.name,
      assignees: sanitizedBody.assignees || [],
      projects: regularProjectIds,
    });

    await newPlanner.save();

    const savedPlanner = await PlannerModel.findById(newPlanner._id).populate('assignees').populate('projects').lean();

    if (!savedPlanner) {
      return NextResponse.json({ error: 'Failed to create planner' }, { status: 500 });
    }

    // Get regular projects from database
    const regularProjects = savedPlanner.projects.map(fromProjectDocument) || [];

    // Always include all default projects in every planner
    const allProjects = [...regularProjects, ...DEFAULT_PROJECTS];

    return NextResponse.json(
      {
        id: savedPlanner._id.toString(),
        name: savedPlanner.name,
        assignees: savedPlanner.assignees.map(fromTeamMemberDocument) || [],
        projects: allProjects,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create planner:', error);
    return NextResponse.json({ error: 'Failed to create planner' }, { status: 500 });
  }
}
