import * as React from 'react';

import { SearchForm } from '@/components/search-form';
import { VersionSwitcher } from '@/components/version-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { BriefcaseIcon, CalendarIcon, SettingsIcon, UsersIcon } from 'lucide-react';

// Application navigation data
const data = {
  versions: ['1.0.0', '0.9.0-beta', '0.8.0-alpha'],
  navMain: [
    {
      title: 'Lego Planner',
      url: '/',
      icon: <CalendarIcon />,
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: <BriefcaseIcon />,
    },
    {
      title: 'Team',
      url: '/team',
      icon: <UsersIcon />,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: <SettingsIcon />,
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
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarContent className="gap-0">
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      {item.icon}
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
}
