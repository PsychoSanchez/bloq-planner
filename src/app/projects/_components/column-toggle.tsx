'use client';

import { ColumnsIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDefinition } from '@/hooks/use-column-visibility';

interface ColumnToggleProps {
  columns: ColumnDefinition[];
  isColumnVisible: (columnId: string) => boolean;
  toggleColumn: (columnId: string) => void;
  resetToDefaults: () => void;
}

export function ColumnToggle({ columns, isColumnVisible, toggleColumn, resetToDefaults }: ColumnToggleProps) {
  const visibleCount = columns.filter((column) => isColumnVisible(column.id)).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="h-9 px-3 gap-2">
          <ColumnsIcon className="h-4 w-4" />
          <span className="text-sm">View</span>
          <span className="text-xs text-muted-foreground">({visibleCount})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="text-xs"
            checked={isColumnVisible(column.id)}
            onCheckedChange={() => toggleColumn(column.id)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground" onSelect={resetToDefaults}>
          <RotateCcwIcon className="h-3 w-3 mr-2" />
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
