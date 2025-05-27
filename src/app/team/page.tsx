import { Suspense } from 'react';
import { TeamMembersList } from '@/app/team/_components/team-members-list';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for the suspense fallback
function TeamMembersLoading() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Team Members</h1>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-2 items-center mb-2 justify-end">
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="rounded-sm border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-4 py-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main page component - now using tRPC client-side component wrapped in Suspense
export default function TeamPage() {
  return (
    <Suspense fallback={<TeamMembersLoading />}>
      <TeamMembersList />
    </Suspense>
  );
}
