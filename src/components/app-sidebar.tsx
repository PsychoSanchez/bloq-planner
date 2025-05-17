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
          title: 'Weekly Report',
          url: '/dashboard/weekly-report',
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
      ],
    },
    {
      title: 'Planner',
      url: '/planner',
      items: [
        {
          title: 'Lego Planner',
          url: '/planner/lego',
        },
        {
          title: 'Timeline',
          url: '/planner/timeline',
        },
      ],
    },
    {
      title: 'Team',
      url: '/team',
      items: [
        {
          title: 'Team Members',
          url: '/team',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      items: [
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
