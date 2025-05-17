'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback, useTransition } from 'react';

export function SearchTeamMembers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Get the current search values from URL search parameters
  const currentSearch = searchParams.get('search') || '';
  const currentDepartment = searchParams.get('department') || 'all';

  // Create a new URLSearchParams instance for building the updated URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      if (value === '' || value === 'all') {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('search', value)}`);
    });
  };

  // Handle department filter changes
  const handleDepartmentChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('department', value)}`);
    });
  };

  return (
    <div className="flex gap-2 items-center mb-2">
      <Input
        placeholder="Search team members..."
        value={currentSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-xs"
      />
      <Select value={currentDepartment} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
