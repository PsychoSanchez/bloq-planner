'use client';

import Link from 'next/link';
import { RouterInput, trpc } from '@/utils/trpc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchTeamMembers } from '@/app/team/_components/search-team-members';
import { NewTeamMemberDialog } from '@/app/team/_components/new-team-member-dialog';
import { EditableRoleCell } from '@/app/team/_components/editable-role-cell';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryState, parseAsString } from 'nuqs';

type UpdateTeamMemberRoleInput = RouterInput['team']['updateTeamMemberRole'];

export function TeamMembersList() {
  const [currentSearch] = useQueryState('search', parseAsString.withDefault(''));

  // tRPC query for fetching team members
  const {
    data: teamMembers,
    isLoading,
    error,
    refetch,
  } = trpc.team.getTeamMembers.useQuery({
    search: currentSearch || undefined,
  });

  // tRPC mutation for updating team member role
  const updateTeamMemberRole = trpc.team.updateTeamMemberRole.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error: unknown) => {
      console.error('Failed to update role:', error);
    },
  });

  const handleRoleUpdate = async (props: UpdateTeamMemberRoleInput) => {
    await updateTeamMemberRole.mutateAsync(props);
  };

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Team Members</h1>
          <NewTeamMemberDialog />
        </div>
        <SearchTeamMembers />
        <div className="rounded-sm border p-4 text-center text-red-600">
          Error loading team members: {error.message}
        </div>
      </div>
    );
  }

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
              <TableHead className="py-1">Name</TableHead>
              <TableHead className="py-1 w-[200px]">Role</TableHead>
              <TableHead className="py-1 w-[200px]">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="py-1">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-1">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-1">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : teamMembers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-16 text-center text-xs">
                  No team members found.
                </TableCell>
              </TableRow>
            ) : (
              teamMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="py-1 font-medium">
                    <Link href={`/team/${member.id}`} className="block cursor-pointer hover:underline">
                      {member.name}
                    </Link>
                  </TableCell>
                  <TableCell className="py-1">
                    <EditableRoleCell
                      memberId={member.id}
                      initialRole={member.role}
                      onRoleUpdate={handleRoleUpdate}
                      isEditable
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    {member.type ? <span className="capitalize">{member.type}</span> : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
