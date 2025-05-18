'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransition } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

export function SearchTeamMembers() {
  const [currentSearch, setCurrentSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [currentDepartment, setCurrentDepartment] = useQueryState('department', parseAsString.withDefault('all'));

  // const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setCurrentSearch(value);
    });
  };

  // Handle department filter changes
  const handleDepartmentChange = (value: string) => {
    startTransition(() => {
      setCurrentDepartment(value);
    });
  };

  return (
    <div className="flex gap-2 items-center mb-2 justify-end">
      <Input
        type="search"
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
