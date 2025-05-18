import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PlannerModel } from '@/lib/models/planner';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import { Planner } from '@/lib/types';
import mongoose from 'mongoose';
import { type } from 'arktype';

interface AssignmentQuery {
  year?: number;
  quarter?: number;
  plannerId?: string;
}

const AssignmentsQuery = type({
  'year?': 'number',
  'quarter?': 'number',
});

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

    const planner = await PlannerModel.findById(id)
      .populate('assignments')
      .populate('projects')
      .populate('assignees')
      .lean();

    if (!planner) {
      return NextResponse.json({ error: 'Planner not found' }, { status: 404 });
    }

    // Get assignments with optional filtering
    const assignmentQuery: AssignmentQuery = {};
    if (year) {
      assignmentQuery.year = parseInt(year);
    }
    if (quarter) {
      assignmentQuery.quarter = parseInt(quarter);
    }

    const sanitizedAssignmentQuery = AssignmentsQuery(assignmentQuery);
    if (sanitizedAssignmentQuery instanceof type.errors) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: sanitizedAssignmentQuery.toJSON() },
        { status: 400 },
      );
    }

    return NextResponse.json({
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees || [],
      projects: planner.projects || [],
      assignments: (planner.assignments || []).filter((assignment) => {
        if (year && assignment.year !== sanitizedAssignmentQuery.year) {
          return false;
        }
        if (quarter && assignment.quarter !== sanitizedAssignmentQuery.quarter) {
          return false;
        }
        return true;
      }),
    });
  } catch (error) {
    console.error('Failed to fetch planner:', error);
    return NextResponse.json({ error: 'Failed to fetch planner' }, { status: 500 });
  }
}

interface UpdatePlannerRequest extends Omit<Planner, 'assignees' | 'projects' | 'assignments'> {
  assignees: string[];
  projects: string[];
  assignments: string[];
}

const UpdatePlannerRequest = type({
  name: 'string',
  assignees: 'string[]',
  projects: 'string[]',
  assignments: 'string[]',
});

// Update a planner
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid planner ID' }, { status: 400 });
    }
    const body = await request.json();
    const sanitizedBody = UpdatePlannerRequest(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Invalid request data', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    await connectToDatabase();

    const updatedPlanner = await PlannerModel.findByIdAndUpdate(
      id,
      { $set: sanitizedBody },
      { new: true, runValidators: true },
    ).lean();

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
    await AssignmentModel.deleteMany(deletedPlanner.assignments.map((assignment) => ({ _id: assignment })));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete planner:', error);
    return NextResponse.json({ error: 'Failed to delete planner' }, { status: 500 });
  }
}
