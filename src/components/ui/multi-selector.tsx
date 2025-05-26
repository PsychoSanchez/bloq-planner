'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MultiSelectorOption {
  id: string;
  value: string;
  name: string;
  searchText?: string; // Optional additional text for search
}

interface MultiSelectorProps {
  options: MultiSelectorOption[];
  value: string[];
  onSelect: (values: string[]) => void;
  type?: 'inline' | 'dropdown';
  isIconEnabled?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  maxDisplayItems?: number;
  className?: string;
}

export const MultiSelector = ({
  options,
  value,
  onSelect,
  type = 'dropdown',
  isIconEnabled = true,
  icon,
  placeholder = 'Select items',
  searchPlaceholder = 'Search...',
  maxDisplayItems = 2,
  className,
}: MultiSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [localSelectedValues, setLocalSelectedValues] = useState<string[]>(value);
  const [searchQuery, setSearchQuery] = useState('');

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedValues(value);
  }, [value]);

  // Update local state when popover opens
  useEffect(() => {
    if (open) {
      setLocalSelectedValues(value);
      setSearchQuery('');
    }
  }, [open, value]);

  // Apply changes when popover closes
  useEffect(() => {
    if (!open && localSelectedValues !== value) {
      // Only call onSelect if the values have actually changed
      const hasChanged =
        localSelectedValues.length !== value.length ||
        localSelectedValues.some((v) => !value.includes(v)) ||
        value.some((v) => !localSelectedValues.includes(v));

      if (hasChanged) {
        onSelect(localSelectedValues);
      }
    }
  }, [open, localSelectedValues, value, onSelect]);

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter((option) => {
        const searchText = option.searchText || option.name;
        return searchText.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : options;

  const handleToggleValue = (optionValue: string) => {
    const newValue = localSelectedValues.includes(optionValue)
      ? localSelectedValues.filter((v) => v !== optionValue)
      : [...localSelectedValues, optionValue];
    setLocalSelectedValues(newValue);
  };

  const handleSelectAll = () => {
    if (localSelectedValues.length === filteredOptions.length) {
      // If all filtered options are selected, deselect them
      const filteredValues = filteredOptions.map((o) => o.value);
      setLocalSelectedValues(localSelectedValues.filter((v) => !filteredValues.includes(v)));
    } else {
      // Select all filtered options
      const filteredValues = filteredOptions.map((o) => o.value);
      const newValues = [...new Set([...localSelectedValues, ...filteredValues])];
      setLocalSelectedValues(newValues);
    }
  };

  const handleClearAll = () => {
    setLocalSelectedValues([]);
  };

  const allFilteredSelected =
    filteredOptions.length > 0 && filteredOptions.every((option) => localSelectedValues.includes(option.value));
  const someFilteredSelected =
    filteredOptions.some((option) => localSelectedValues.includes(option.value)) && !allFilteredSelected;

  // Get display text for the trigger
  const getDisplayText = () => {
    if (value.length === 0) return placeholder;

    if (value.length === 1) {
      const option = options.find((o) => o.value === value[0]);
      return option?.name || value[0];
    }

    // Show up to maxDisplayItems, then show first item + counter
    if (value.length <= maxDisplayItems) {
      const displayNames = value.slice(0, maxDisplayItems).map((v) => options.find((o) => o.value === v)?.name || v);

      const combinedText = displayNames.join(', ');

      // If combined text is reasonable length, show all items
      if (combinedText.length <= 30) {
        return combinedText;
      }
    }

    // For items that don't fit or exceed maxDisplayItems, show first item + counter
    const firstOption = options.find((o) => o.value === value[0]);
    const firstName = firstOption?.name || value[0];
    return firstName;
  };

  // Get counter for additional items (only show if there are more items beyond what's displayed)
  const getAdditionalCount = () => {
    if (value.length <= 1) return 0;

    // If we're within maxDisplayItems and the combined text fits, don't show counter
    if (value.length <= maxDisplayItems) {
      const displayNames = value.slice(0, maxDisplayItems).map((v) => options.find((o) => o.value === v)?.name || v);

      const combinedText = displayNames.join(', ');

      // If combined text fits, don't show counter
      if (combinedText.length <= 30) {
        return 0;
      }
    }

    // Show counter for additional items beyond the first one
    return value.length - 1;
  };

  const triggerClasses = cn(
    'flex items-center gap-1.5 cursor-pointer transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
    type === 'inline'
      ? 'data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:outline-destructive w-fit justify-between rounded-sm px-1 py-0 text-sm whitespace-nowrap shadow-xs focus-visible:ring-[3px] h-5 dark:hover:bg-input/30'
      : 'border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 w-fit justify-between rounded-sm border bg-transparent px-1.5 py-0 text-sm whitespace-nowrap shadow-xs focus-visible:ring-[3px] h-7',
    className,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClasses}>
          {isIconEnabled && icon}
          <span className={cn(value.length === 0 && 'text-muted-foreground')}>{getDisplayText()}</span>
          {getAdditionalCount() > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-xs">
              +{getAdditionalCount()}
            </Badge>
          )}
          <ChevronDownIcon className="h-3.5 w-3.5 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-0" align="start">
        <div className="flex flex-col">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-7 h-7 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={false}
              />
            </div>
          </div>

          {/* Header with Select All */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b">
            <button
              type="button"
              className="flex items-center space-x-1.5 text-xs font-medium cursor-pointer hover:text-foreground transition-colors"
              onClick={handleSelectAll}
            >
              <div className="flex items-center justify-center w-3.5 h-3.5">
                {allFilteredSelected && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
                {someFilteredSelected && <div className="w-1.5 h-1.5 bg-primary rounded-sm opacity-60" />}
              </div>
              <span>Select all</span>
            </button>
            {localSelectedValues.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto p-0.5 text-xs">
                Clear
              </Button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                {searchQuery ? 'No results found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = localSelectedValues.includes(option.value);
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleToggleValue(option.value)}
                  >
                    <Label htmlFor={`option-${option.id}`} className="text-xs cursor-pointer flex-1">
                      {option.name}
                    </Label>
                    <div className="flex items-center justify-center w-3.5 h-3.5 ml-1.5">
                      {isSelected && <CheckIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
