'use client';

import { Input } from '@/components/ui/input';
import { useTransition } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

export function SearchTeamMembers() {
  const [currentSearch, setCurrentSearch] = useQueryState('search', parseAsString.withDefault(''));

  const [, startTransition] = useTransition();

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setCurrentSearch(value);
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
    </div>
  );
}
