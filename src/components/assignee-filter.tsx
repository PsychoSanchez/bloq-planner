'use client';

import { useState } from 'react';
import { Assignee } from '@/lib/types';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckIcon, FilterIcon, SearchIcon, XIcon } from 'lucide-react';

interface AssigneeFilterProps {
  assignees: Assignee[];
  selectedAssigneeIds: string[];
  onAssigneesChange: (assigneeIds: string[]) => void;
}

export function AssigneeFilter({ assignees, selectedAssigneeIds, onAssigneesChange }: AssigneeFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedAssigneeIds);

  const filteredAssignees = searchQuery
    ? assignees.filter((assignee) =>
        assignee.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
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
      prev.includes(assigneeId)
        ? prev.filter((id) => id !== assigneeId)
        : [...prev, assigneeId]
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

  const hasFilters = selectedAssigneeIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1 text-xs h-7',
              hasFilters && 'text-primary font-medium'
            )}
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Assignees
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
            className="h-7 w-7 p-0"
            onClick={clearFilters}
          >
            <XIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Assignees</DialogTitle>
          <DialogDescription>
            Select assignees to filter the planning board
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mt-2">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignees..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="mt-2 border-t py-2">
          <div 
            className="flex items-center space-x-2 mb-4 py-2 border-b cursor-pointer"
            onClick={handleSelectAll}
          >
            <Checkbox
              id="select-all"
              checked={localSelectedIds.length === assignees.length && assignees.length > 0}
              className={cn(
                localSelectedIds.length > 0 && localSelectedIds.length < assignees.length
                  ? 'opacity-60'
                  : ''
              )}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {localSelectedIds.length === assignees.length && assignees.length > 0
                ? 'Deselect all'
                : 'Select all'}
            </label>
          </div>
          
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2">
            {filteredAssignees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No assignees found
              </p>
            ) : (
              filteredAssignees.map((assignee) => (
                <div 
                  key={assignee.id} 
                  className="flex items-center space-x-2 cursor-pointer py-2"
                  onClick={() => handleToggleAssignee(assignee.id)}
                >
                  <Checkbox
                    id={`assignee-${assignee.id}`}
                    checked={localSelectedIds.includes(assignee.id)}
                  />
                  <label
                    htmlFor={`assignee-${assignee.id}`}
                    className="text-sm leading-none cursor-pointer flex items-center justify-between w-full"
                  >
                    <span className="truncate">{assignee.name}</span>
                    {localSelectedIds.includes(assignee.id) && (
                      <CheckIcon className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                    )}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-4 flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 