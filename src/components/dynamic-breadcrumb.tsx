'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/utils/trpc';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Helper function to capitalize strings
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // Filter out empty strings

  // Check if we're on a project detail page
  const isProjectDetailPage = segments[0] === 'projects' && segments[1] && segments.length >= 2;
  const projectId = isProjectDetailPage ? segments[1] : null;

  // Check if we're on a planner detail page (e.g., /planner/lego/[id])
  const isPlannerDetailPage =
    segments[0] === 'planner' && segments[1] === 'lego' && segments[2] && segments.length >= 3;
  const plannerId = isPlannerDetailPage ? segments[2] : null;

  // Fetch project data if we're on a project detail page
  const { data: project } = trpc.project.getProjectById.useQuery(
    { id: projectId! },
    {
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Fetch planner data if we're on a planner detail page
  const { data: planner } = trpc.planner.getPlannerById.useQuery(
    { id: plannerId! },
    {
      enabled: !!plannerId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const getSegmentDisplay = (segment: string, index: number): string => {
    // If this is the project ID segment and we have project data, show the project name
    if (index === 1 && segments[0] === 'projects' && project) {
      return project.name;
    }

    // If this is the planner ID segment and we have planner data, show the planner name
    if (index === 2 && segments[0] === 'planner' && segments[1] === 'lego' && planner) {
      return planner.name;
    }

    // For other segments, just capitalize
    return capitalize(segment);
  };

  if (segments.length === 0) {
    // Optionally, render a default breadcrumb for the homepage
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Special handling for planner detail pages to simplify breadcrumb
  if (isPlannerDetailPage && planner) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{planner.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const displayName = getSegmentDisplay(segment, index);

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
