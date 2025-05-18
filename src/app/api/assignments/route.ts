import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import { Assignment } from '@/lib/types';
import mongoose from 'mongoose';

interface AssignmentDocument extends Assignment {
  _id: mongoose.Types.ObjectId;
}

interface AssignmentQuery {
  year?: number;
  quarter?: number;
  assigneeId?: string;
  projectId?: string;
}

// Get all assignments with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');
    const assigneeId = searchParams.get('assigneeId');
    const projectId = searchParams.get('projectId');

    await connectToDatabase();

    // Build query based on provided filters
    const query: AssignmentQuery = {};
    if (year) query.year = parseInt(year);
    if (quarter) query.quarter = parseInt(quarter);
    if (assigneeId) query.assigneeId = assigneeId;
    if (projectId) query.projectId = projectId;

    const assignments = (await AssignmentModel.find(query).lean()) as unknown as AssignmentDocument[];

    // Transform MongoDB documents to match Assignment interface
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment._id.toString(),
      assigneeId: assignment.assigneeId,
      projectId: assignment.projectId,
      week: assignment.week,
      year: assignment.year,
      quarter: assignment.quarter,
      status: assignment.status,
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.assigneeId || !body.projectId || !body.week || !body.year || !body.quarter) {
      return NextResponse.json(
        { error: 'Missing required fields: assigneeId, projectId, week, year, and quarter are required' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const newAssignment = new AssignmentModel({
      assigneeId: body.assigneeId,
      projectId: body.projectId,
      week: body.week,
      year: body.year,
      quarter: body.quarter,
      status: body.status || 'planned',
    });

    await newAssignment.save();

    return NextResponse.json(
      {
        id: newAssignment._id.toString(),
        assigneeId: newAssignment.assigneeId,
        projectId: newAssignment.projectId,
        week: newAssignment.week,
        year: newAssignment.year,
        quarter: newAssignment.quarter,
        status: newAssignment.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
