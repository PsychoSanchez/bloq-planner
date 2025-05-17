import { Suspense } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchTeamMembers } from '@/components/search-team-members';
import { RoleBadge } from '@/components/role-badge';
import { NewTeamMemberDialog } from '@/components/new-team-member-dialog';
import { Assignee } from '@/lib/types';
import { TeamMemberModel } from '@/lib/models/team-member';
import { connectToDatabase } from '@/lib/mongodb';

// Server component for fetching and displaying team members
async function TeamMembers({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  // If the database is not ready, use sample data in development
  let teamMembers: (Assignee & { email?: string; role?: string; department?: string; title?: string })[] = [];

  try {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (searchParams.department && searchParams.department !== 'all') {
      query.department = searchParams.department;
    }

    if (searchParams.search) {
      query.name = { $regex: searchParams.search, $options: 'i' };
    }

    const teamMemberDocs = await TeamMemberModel.find(query).sort({ name: 1 });
    teamMembers = teamMemberDocs.map((doc) => doc.toJSON());
  } catch (error) {
    console.error('Error fetching team members from database:', error);
    // In development, we can fall back to sample data if needed
    if (process.env.NODE_ENV === 'development') {
      const { getSampleData } = await import('@/lib/sample-data');
      teamMembers = getSampleData().assignees.filter((assignee) => assignee.type === 'person') as (Assignee & {
        email?: string;
        role?: string;
        department?: string;
        title?: string;
      })[];
    }
  }

  return (
    <>
      {teamMembers.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="h-16 text-center text-xs">
            No team members found.
          </TableCell>
        </TableRow>
      ) : (
        teamMembers.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="py-1 px-2 font-medium">
              <Link href={`/team/${member.id}`} className="block cursor-pointer hover:underline">
                {member.name}
              </Link>
            </TableCell>
            <TableCell className="py-1 px-2">{member.email || 'N/A'}</TableCell>
            <TableCell className="py-1 px-2">
              {member.department ? <span className="capitalize">{member.department}</span> : 'N/A'}
            </TableCell>
            <TableCell className="py-1 px-2">{member.role ? <RoleBadge role={member.role} /> : 'N/A'}</TableCell>
            <TableCell className="py-1 px-2">{member.title || 'N/A'}</TableCell>
          </TableRow>
        ))
      )}
    </>
  );
}

// Main page component
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Team Members</h1>
        <NewTeamMemberDialog />
      </div>

      <SearchTeamMembers />

      <div className="rounded-sm border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 w-[200px]">Name</TableHead>
              <TableHead className="py-1 px-2">Email</TableHead>
              <TableHead className="py-1 px-2">Department</TableHead>
              <TableHead className="py-1 px-2">Role</TableHead>
              <TableHead className="py-1 px-2">Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Suspense
              fallback={
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center">
                    Loading team members...
                  </TableCell>
                </TableRow>
              }
            >
              <TeamMembers searchParams={await searchParams} />
            </Suspense>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
