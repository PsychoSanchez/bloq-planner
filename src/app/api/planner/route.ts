import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { fromPlannerDocument, PlannerModel } from '@/lib/models/planner';
import { Planner } from '@/lib/types';
import { type } from 'arktype';
import { fromTeamMemberDocument } from '@/lib/models/team-member';
import { fromProjectDocument } from '@/lib/models/project';
import { fromAssignmentDocument } from '@/lib/models/planner-assignment';

export async function GET() {
  try {
    await connectToDatabase();
    const planners = await PlannerModel.find()
      .populate('assignees')
      .populate('projects')
      .populate('assignments')
      .lean();

    // Transform MongoDB documents to match Planner interface
    const formattedPlanners: Planner[] = planners.map((planner) => ({
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees.map(fromTeamMemberDocument) || [],
      projects: planner.projects.map(fromProjectDocument) || [],
      assignments: planner.assignments.map(fromAssignmentDocument) || [],
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
  assignments: 'string[]',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitizedBody = CreatePlannerRequest(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Invalid request data', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    await connectToDatabase();
    const newPlanner = new PlannerModel({
      name: sanitizedBody.name,
      assignees: sanitizedBody.assignees || [],
      projects: sanitizedBody.projects || [],
      assignments: sanitizedBody.assignments || [],
    });

    await newPlanner.save();

    const savedPlanner = await PlannerModel.findById(newPlanner._id)
      .populate('assignees')
      .populate('projects')
      .populate('assignments')
      .lean();

    if (!savedPlanner) {
      return NextResponse.json({ error: 'Failed to create planner' }, { status: 500 });
    }

    return NextResponse.json(fromPlannerDocument(savedPlanner), { status: 201 });
  } catch (error) {
    console.error('Failed to create planner:', error);
    return NextResponse.json({ error: 'Failed to create planner' }, { status: 500 });
  }
}
