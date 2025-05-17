'use client';

import { Button } from '@/components/ui/button';
import {
  CompactCard,
  CompactCardAction,
  CompactCardContent,
  CompactCardDescription,
  CompactCardFooter,
  CompactCardHeader,
  CompactCardTitle,
} from '@/components/ui/compact-card';

export function CompactCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Basic compact card */}
      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle>Project Overview</CompactCardTitle>
          <CompactCardDescription>Quick stats for your project</CompactCardDescription>
        </CompactCardHeader>
        <CompactCardContent>
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-muted-foreground">Tasks:</div>
              <div className="text-right">42</div>
              <div className="text-muted-foreground">Completed:</div>
              <div className="text-right">24</div>
              <div className="text-muted-foreground">Progress:</div>
              <div className="text-right">57%</div>
            </div>
          </div>
        </CompactCardContent>
        <CompactCardFooter>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            View Details
          </Button>
        </CompactCardFooter>
      </CompactCard>

      {/* Card with action */}
      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle>Recent Activity</CompactCardTitle>
          <CompactCardDescription>Last 24 hours</CompactCardDescription>
          <CompactCardAction>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">More options</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </CompactCardAction>
        </CompactCardHeader>
        <CompactCardContent className="space-y-1">
          <div className="text-xs">
            <span className="font-medium">Alice</span> <span className="text-muted-foreground">updated task #3</span>
          </div>
          <div className="text-xs">
            <span className="font-medium">Bob</span> <span className="text-muted-foreground">completed task #7</span>
          </div>
          <div className="text-xs">
            <span className="font-medium">Charlie</span>{' '}
            <span className="text-muted-foreground">added 3 new tasks</span>
          </div>
        </CompactCardContent>
        <CompactCardFooter>
          <Button size="sm" variant="link" className="h-6 p-0 text-xs">
            View all activity
          </Button>
        </CompactCardFooter>
      </CompactCard>

      {/* Simple status card */}
      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle>Project Status</CompactCardTitle>
        </CompactCardHeader>
        <CompactCardContent>
          <div className="flex items-center">
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary"></div>
            </div>
            <span className="ml-2 text-xs font-medium">67%</span>
          </div>
        </CompactCardContent>
        <CompactCardFooter className="justify-between">
          <span className="text-xs text-muted-foreground">Updated 2h ago</span>
          <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
            Refresh
          </Button>
        </CompactCardFooter>
      </CompactCard>
    </div>
  );
}
