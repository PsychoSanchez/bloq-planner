import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PlannerModel } from '@/lib/models/planner';
import { Planner } from '@/lib/types';
import { type } from 'arktype';

export async function GET() {
  try {
    await connectToDatabase();
    const planners = await PlannerModel.find().lean();

    // Transform MongoDB documents to match Planner interface
    const formattedPlanners: Planner[] = planners.map((planner) => ({
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees || [],
      projects: planner.projects || [],
      assignments: planner.assignments || [],
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

    return NextResponse.json(
      {
        id: newPlanner._id.toString(),
        name: newPlanner.name,
        assignees: newPlanner.assignees,
        projects: newPlanner.projects,
        assignments: newPlanner.assignments,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create planner:', error);
    return NextResponse.json({ error: 'Failed to create planner' }, { status: 500 });
  }
}
