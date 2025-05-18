import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import mongoose from 'mongoose';
import { Assignment } from '@/lib/types';

interface AssignmentDocument extends Assignment {
  _id: mongoose.Types.ObjectId;
}

// Get a specific assignment by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const assignment = (await AssignmentModel.findById(id).lean()) as unknown as AssignmentDocument;

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: assignment._id.toString(),
      assigneeId: assignment.assigneeId,
      projectId: assignment.projectId,
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

// Update an assignment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const updatedAssignment = (await AssignmentModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    ).lean()) as unknown as AssignmentDocument;

    if (!updatedAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedAssignment._id.toString(),
      assigneeId: updatedAssignment.assigneeId,
      projectId: updatedAssignment.projectId,
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
