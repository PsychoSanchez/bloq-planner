'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarNavigationProps {
  currentYear: number;
  currentQuarter: number;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: number) => void;
}

export function CalendarNavigation({
  currentYear,
  currentQuarter,
  onYearChange,
  onQuarterChange,
}: CalendarNavigationProps) {
  // Generate years (current year - 1 to current year + 3)
  const currentSystemYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentSystemYear - 1 + i);

  // Quarters
  const quarters = [1, 2, 3, 4];

  // Helper for navigation
  const navigatePrevious = () => {
    if (currentQuarter === 1) {
      onYearChange(currentYear - 1);
      onQuarterChange(4);
    } else {
      onQuarterChange(currentQuarter - 1);
    }
  };

  const navigateNext = () => {
    if (currentQuarter === 4) {
      onYearChange(currentYear + 1);
      onQuarterChange(1);
    } else {
      onQuarterChange(currentQuarter + 1);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button variant="outline" size="icon" onClick={navigatePrevious} className="h-9 w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={currentYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentQuarter.toString()} onValueChange={(value) => onQuarterChange(parseInt(value))}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Quarter" />
        </SelectTrigger>
        <SelectContent>
          {quarters.map((quarter) => (
            <SelectItem key={quarter} value={quarter.toString()}>
              Q{quarter}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={navigateNext} className="h-9 w-9">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
