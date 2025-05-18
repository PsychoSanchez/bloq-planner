import { NextRequest, NextResponse } from 'next/server';
import { TeamMemberModel } from '@/lib/models/team-member';
import { connectToDatabase } from '@/lib/mongodb';
import { type } from 'arktype';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get search parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const teamMembers = await TeamMemberModel.find(query).sort({ name: 1 });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

const CreateTeamMemberRequestBody = type({
  name: 'string < 255',
  email: 'string < 255',
  role: 'string < 100',
  department: 'string < 100',
  title: 'string < 255',
  type: 'string < 32',
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get team member data from request body
    const body = await request.json();
    const sanitizedBody = CreateTeamMemberRequestBody(body);

    if (sanitizedBody instanceof type.errors) {
      return NextResponse.json({ error: 'Validation error', details: sanitizedBody.toJSON() }, { status: 400 });
    }

    // Create new team member
    const teamMember = new TeamMemberModel(sanitizedBody);
    await teamMember.save();

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);

    // Check for duplicate email error
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
