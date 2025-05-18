import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import mongoose from 'mongoose';
import { type } from 'arktype';

// Get a specific assignment by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const assignment = await AssignmentModel.findById(id).lean();

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: assignment._id.toString(),
      assigneeId: assignment.assigneeId,
      projectId: assignment.projectId,
      plannerId: assignment.plannerId,
      week: assignment.week,
      year: assignment.year,
      quarter: assignment.quarter,
      status: assignment.status,
    });
  } catch (error) {
    console.error('Failed to fetch assignment:', error);
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 });
  }
}

const PatchAssignmentRequestBody = type({
  'assigneeId?': 'string',
  'projectId?': 'string',
  'plannerId?': 'string',
  'week?': '0 <= number.integer <= 52',
  'year?': 'number.integer >= 1970',
  'quarter?': '0 < number <= 5',
  'status?': 'string < 50',
});

// Update an assignment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sanitizedBody = PatchAssignmentRequestBody(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Validation error', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
      id,
      { $set: sanitizedBody },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedAssignment._id.toString(),
      assigneeId: updatedAssignment.assigneeId,
      projectId: updatedAssignment.projectId,
      plannerId: updatedAssignment.plannerId,
      week: updatedAssignment.week,
      year: updatedAssignment.year,
      quarter: updatedAssignment.quarter,
      status: updatedAssignment.status,
    });
  } catch (error) {
    console.error('Failed to update assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}

// Delete an assignment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const deletedAssignment = await AssignmentModel.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
