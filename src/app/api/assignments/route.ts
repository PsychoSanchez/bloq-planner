import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import { type } from 'arktype';

interface AssignmentQuery {
  year?: number;
  quarter?: number;
  assigneeId?: string;
  projectId?: string;
  plannerId?: string;
}

const AssignmentQueryRequest = type({
  'year?': 'number.integer >= 1970',
  'quarter?': '0 < number <= 5',
  'assigneeId?': 'string',
  'projectId?': 'string',
  'plannerId?': 'string',
});

// Get all assignments with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');
    const assigneeId = searchParams.get('assigneeId');
    const projectId = searchParams.get('projectId');
    const plannerId = searchParams.get('plannerId');

    await connectToDatabase();

    // Build query based on provided filters
    const query: AssignmentQuery = {};
    if (year) query.year = parseInt(year);
    if (quarter) query.quarter = parseInt(quarter);
    if (assigneeId) query.assigneeId = assigneeId;
    if (projectId) query.projectId = projectId;
    if (plannerId) query.plannerId = plannerId;

    const sanitizedAssignmentQuery = AssignmentQueryRequest(query);

    if (sanitizedAssignmentQuery instanceof type.errors) {
      return NextResponse.json(
        { error: 'Validation Error', details: sanitizedAssignmentQuery.toJSON() },
        { status: 400 },
      );
    }

    const assignments = await AssignmentModel.find(sanitizedAssignmentQuery).lean();

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

const CreateAssignmentRequestBody = type({
  assigneeId: 'string',
  projectId: 'string',
  plannerId: 'string',
  week: '0 <= number.integer <= 52',
  year: 'number.integer >= 1970',
  quarter: '0 < number <= 5',
  'status?': 'string | undefined',
});

// Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sanitizedBody = CreateAssignmentRequestBody(body);
    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Validation Error', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    await connectToDatabase();

    const newAssignment = new AssignmentModel({
      assigneeId: sanitizedBody.assigneeId,
      projectId: sanitizedBody.projectId,
      plannerId: sanitizedBody.plannerId,
      week: sanitizedBody.week,
      year: sanitizedBody.year,
      quarter: sanitizedBody.quarter,
      status: sanitizedBody.status || 'planned',
    });

    await newAssignment.save();

    return NextResponse.json(
      {
        id: newAssignment._id.toString(),
        assigneeId: newAssignment.assigneeId,
        projectId: newAssignment.projectId,
        plannerId: newAssignment.plannerId,
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
