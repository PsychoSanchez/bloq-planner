import React from 'react';
import { cn } from '@/lib/utils';
import { CurrentTimeMarker } from './current-time-marker';

interface WeekHeaderProps {
  week: {
    weekNumber: number;
    startDate: string;
    endDate: string;
  };
  columnWidth: number;
  isCurrentWeek: boolean;
  isCurrentDate: boolean;
  highlightCurrentWeek: boolean;
  markerPosition: number;
}

export function WeekHeader({
  week,
  columnWidth,
  isCurrentWeek,
  isCurrentDate,
  highlightCurrentWeek,
  markerPosition,
}: WeekHeaderProps) {
  return (
    <th
      className={cn(
        'p-0 text-center border-r dark:border-zinc-700 last:border-r-0 relative',
        highlightCurrentWeek && isCurrentWeek && 'bg-amber-50/30 dark:bg-amber-950/20',
      )}
      style={{
        minWidth: `${columnWidth}px`,
        width: `${columnWidth}px`,
        transition: 'width 0.2s ease-in-out',
      }}
    >
      <div className="flex flex-col items-center justify-center h-7 p-0.5 text-foreground dark:text-gray-300">
        <div className={cn('text-xs font-medium', isCurrentWeek && 'text-amber-700 dark:text-amber-300')}>
          {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div
          className={cn(
            'text-xs mt-1 text-muted-foreground dark:text-gray-400',
            isCurrentWeek && 'text-amber-600 dark:text-amber-400',
          )}
        >
          Week {week.weekNumber}
        </div>
      </div>
      {/* Current time marker with arrow */}
      {isCurrentDate && <CurrentTimeMarker markerPosition={markerPosition} showArrow />}
    </th>
  );
}
