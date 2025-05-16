import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { SearchForm } from '@/components/search-form';
import { VersionSwitcher } from '@/components/version-switcher';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Application navigation data
const data = {
  versions: ['1.0.0', '0.9.0-beta', '0.8.0-alpha'],
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      items: [
        {
          title: 'Overview',
          url: '/dashboard',
          isActive: true,
        },
        {
          title: 'Analytics',
          url: '/dashboard/analytics',
        },
        {
          title: 'Reports',
          url: '/dashboard/reports',
        },
      ],
    },
    {
      title: 'Projects',
      url: '/projects',
      items: [
        {
          title: 'All Projects',
          url: '/projects',
        },
        {
          title: 'Create New',
          url: '/projects/new',
        },
        {
          title: 'Templates',
          url: '/projects/templates',
        },
        {
          title: 'Archive',
          url: '/projects/archive',
        },
      ],
    },
    {
      title: 'Planner',
      url: '/planner',
      items: [
        {
          title: 'Calendar View',
          url: '/planner/calendar',
        },
        {
          title: 'Kanban Board',
          url: '/planner/kanban',
        },
        {
          title: 'Timeline',
          url: '/planner/timeline',
        },
        {
          title: 'Task List',
          url: '/planner/tasks',
        },
      ],
    },
    {
      title: 'Teams',
      url: '/teams',
      items: [
        {
          title: 'Team Members',
          url: '/teams/members',
        },
        {
          title: 'Roles & Permissions',
          url: '/teams/roles',
        },
        {
          title: 'Workload',
          url: '/teams/workload',
        },
      ],
    },
    {
      title: 'Resources',
      url: '/resources',
      items: [
        {
          title: 'Inventory',
          url: '/resources/inventory',
        },
        {
          title: 'Allocation',
          url: '/resources/allocation',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      items: [
        {
          title: 'Account',
          url: '/settings/account',
        },
        {
          title: 'Preferences',
          url: '/settings',
        },
        {
          title: 'Integrations',
          url: '/settings/integrations',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible key={item.title} title={item.title} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}{' '}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
