import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PlannerModel } from '@/lib/models/planner';
import { Planner, Assignee, Project, Assignment } from '@/lib/types';
import mongoose from 'mongoose';

interface PlannerLean {
  _id: mongoose.Types.ObjectId;
  name: string;
  assignees: Assignee[];
  projects: Project[];
  assignments: Assignment[];
}

export async function GET() {
  try {
    await connectToDatabase();
    const planners = (await PlannerModel.find().lean()) as unknown as PlannerLean[];

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Planner name is required' }, { status: 400 });
    }

    await connectToDatabase();
    const newPlanner = new PlannerModel({
      name: body.name,
      assignees: body.assignees || [],
      projects: body.projects || [],
      assignments: body.assignments || [],
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
