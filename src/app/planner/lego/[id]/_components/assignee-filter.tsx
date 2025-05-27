'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { Assignee } from '@/lib/types';
import { ROLE_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckIcon, FilterIcon, SearchIcon, XIcon, UsersIcon } from 'lucide-react';

interface AssigneeFilterProps {
  assignees: Assignee[];
  selectedAssigneeIds: string[];
  onAssigneesChange: (assigneeIds: string[]) => void;
}

// Helper function to get role icon
const getRoleIcon = (role?: string) => {
  if (!role) return null;

  const roleOption = ROLE_OPTIONS.find((r) => r.id === role);
  if (!roleOption) return null;

  const IconComponent = roleOption.icon;
  return <IconComponent className="h-3.5 w-3.5 text-muted-foreground mr-2" />;
};

export function AssigneeFilter({ assignees, selectedAssigneeIds, onAssigneesChange }: AssigneeFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedAssigneeIds);

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedIds(selectedAssigneeIds);
  }, [selectedAssigneeIds]);

  // Update local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedAssigneeIds);
      setSearchQuery('');
    }
  }, [open, selectedAssigneeIds]);

  const filteredAssignees = searchQuery
    ? assignees.filter((assignee) => assignee.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : assignees;

  const handleSelectAll = () => {
    if (localSelectedIds.length === assignees.length) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(assignees.map((a) => a.id));
    }
  };

  const handleToggleAssignee = (assigneeId: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(assigneeId) ? prev.filter((id) => id !== assigneeId) : [...prev, assigneeId],
    );
  };

  const handleApply = () => {
    onAssigneesChange(localSelectedIds);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedAssigneeIds);
    setOpen(false);
  };

  const clearFilters = () => {
    setLocalSelectedIds([]);
    onAssigneesChange([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, assigneeId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleAssignee(assigneeId);
    }
  };

  const hasFilters = selectedAssigneeIds.length > 0;
  const allSelected = localSelectedIds.length === assignees.length && assignees.length > 0;
  const someSelected = localSelectedIds.length > 0 && localSelectedIds.length < assignees.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1 text-xs h-7 hover:bg-muted transition-colors',
              hasFilters && 'text-primary font-medium',
            )}
            aria-label={`Filter assignees. ${hasFilters ? `${selectedAssigneeIds.length} selected` : 'None selected'}`}
          >
            {hasFilters ? <FilterIcon className="h-3.5 w-3.5" /> : <UsersIcon className="h-3.5 w-3.5" />}
            <span>Assignees</span>
            {hasFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {selectedAssigneeIds.length}
              </span>
            )}
          </Button>
        </DialogTrigger>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted transition-colors ml-1"
            onClick={clearFilters}
            aria-label="Clear assignee filters"
          >
            <XIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>

      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col" onEscapeKeyDown={handleCancel}>
        <DialogHeader className="pb-2">
          <DialogTitle>Filter Assignees</DialogTitle>
          <DialogDescription>Select assignees to filter the planning board</DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search assignees..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search assignees"
          />
        </div>

        <div className="border-t flex-1 overflow-hidden flex flex-col">
          <div
            className="flex items-center space-x-2 py-3 px-2 border-b cursor-pointer rounded hover:bg-muted transition-colors"
            onClick={handleSelectAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectAll();
              }
            }}
            tabIndex={0}
            role="checkbox"
            aria-checked={allSelected}
            aria-label={allSelected ? 'Deselect all assignees' : 'Select all assignees'}
          >
            <Checkbox
              id="select-all"
              checked={allSelected}
              className={cn(someSelected ? 'opacity-60' : '')}
              onCheckedChange={() => handleSelectAll()}
            />
            <Label htmlFor="select-all" className="text-sm font-medium leading-none cursor-pointer w-full">
              {allSelected ? 'Deselect all' : 'Select all'}
            </Label>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 py-2">
            {filteredAssignees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No assignees found</p>
            ) : (
              filteredAssignees.map((assignee) => {
                const isSelected = localSelectedIds.includes(assignee.id);
                return (
                  <div
                    key={assignee.id}
                    className="flex items-center space-x-2 py-2 px-2 rounded hover:bg-muted transition-colors"
                    onClick={() => handleToggleAssignee(assignee.id)}
                    onKeyDown={(e) => handleKeyDown(e, assignee.id)}
                    tabIndex={0}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`${assignee.name}, ${isSelected ? 'selected' : 'not selected'}`}
                  >
                    <Checkbox
                      id={`assignee-${assignee.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleAssignee(assignee.id)}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={`assignee-${assignee.id}`}
                      className="text-sm leading-none cursor-pointer flex items-center justify-between w-full"
                    >
                      <div className="flex items-center min-w-0">
                        {getRoleIcon(assignee.role)}
                        <span className="truncate">{assignee.name}</span>
                      </div>
                      {isSelected && <CheckIcon className="h-4 w-4 text-primary ml-2 flex-shrink-0" />}
                    </Label>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-2">
          <div className="text-xs text-muted-foreground">
            {localSelectedIds.length} of {assignees.length} selected
          </div>
          <DialogFooter className="p-0 gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCancel} size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleApply} size="sm">
              Apply Filters
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
