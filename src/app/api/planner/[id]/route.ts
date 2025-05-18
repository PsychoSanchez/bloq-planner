import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PlannerModel } from '@/lib/models/planner';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import { Assignee, Project, Assignment } from '@/lib/types';
import mongoose from 'mongoose';

interface PlannerLean {
  _id: mongoose.Types.ObjectId;
  name: string;
  assignees: Assignee[];
  projects: Project[];
  assignments: Assignment[];
}

interface AssignmentQuery {
  year?: number;
  quarter?: number;
  plannerId?: string;
}

// Get a specific planner by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid planner ID' }, { status: 400 });
    }

    const planner = (await PlannerModel.findById(id).lean()) as unknown as PlannerLean;

    if (!planner) {
      return NextResponse.json({ error: 'Planner not found' }, { status: 404 });
    }

    // Get assignments with optional filtering
    const assignmentQuery: AssignmentQuery = {};
    if (year) assignmentQuery.year = parseInt(year);
    if (quarter) assignmentQuery.quarter = parseInt(quarter);

    const assignments = (await AssignmentModel.find(assignmentQuery).lean()) as unknown as Assignment[];

    return NextResponse.json({
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees || [],
      projects: planner.projects || [],
      assignments,
    });
  } catch (error) {
    console.error('Failed to fetch planner:', error);
    return NextResponse.json({ error: 'Failed to fetch planner' }, { status: 500 });
  }
}

// Update a planner
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid planner ID' }, { status: 400 });
    }

    const updatedPlanner = (await PlannerModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    ).lean()) as unknown as PlannerLean;

    if (!updatedPlanner) {
      return NextResponse.json({ error: 'Planner not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedPlanner._id.toString(),
      name: updatedPlanner.name,
      assignees: updatedPlanner.assignees || [],
      projects: updatedPlanner.projects || [],
      assignments: updatedPlanner.assignments || [],
    });
  } catch (error) {
    console.error('Failed to update planner:', error);
    return NextResponse.json({ error: 'Failed to update planner' }, { status: 500 });
  }
}

// Delete a planner
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid planner ID' }, { status: 400 });
    }

    const deletedPlanner = await PlannerModel.findByIdAndDelete(id);

    if (!deletedPlanner) {
      return NextResponse.json({ error: 'Planner not found' }, { status: 404 });
    }

    // Also delete related assignments
    await AssignmentModel.deleteMany({ plannerId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete planner:', error);
    return NextResponse.json({ error: 'Failed to delete planner' }, { status: 500 });
  }
}
