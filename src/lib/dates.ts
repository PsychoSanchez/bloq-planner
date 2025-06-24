import assert from 'assert';
import { WeekData } from './types';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- weeknumber doesn't have a module declaration
const { weekNumber, weeksPerYear } = require('weeknumber') as {
  weekNumber: (date: Date) => number;
  weeksPerYear: (year: number) => number;
};

// Helper function to format date as YYYY-MM-DD without timezone issues
const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMondayAndSundayOfWeek = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  const end = new Date(date);
  start.setDate(date.getDate() - date.getDay() + 1);
  end.setDate(date.getDate() - date.getDay() + 7);
  return { start, end };
};

// Generate all weeks for a given year
export const generateAllWeeksForYear = (year: number): WeekData[] => {
  const weeks: WeekData[] = [];
  const weeeksInAYear = weeksPerYear(year);

  const date = new Date(year, 0, 1);
  for (let i = 0; i < weeeksInAYear; i++) {
    date.setDate(date.getDate() + 7 * Number(i > 0));
    const week = weekNumber(date);
    const { start: weekStart, end: weekEnd } = getMondayAndSundayOfWeek(date);
    weeks.push({
      weekNumber: week,
      startDate: formatDateToYMD(weekStart),
      endDate: formatDateToYMD(weekEnd),
    });
  }

  return weeks;
};

// Get quarter date ranges
const getQuarterWeekStartNumbers = (year: number): Record<number, number> => {
  return {
    1: 1,
    2: weekNumber(new Date(year, 3, 1)),
    3: weekNumber(new Date(year, 6, 1)),
    4: weekNumber(new Date(year, 9, 1)),
  };
};

// Generate weeks for a specific quarter and year
export const generateWeeks = (year: number, quarter: number): WeekData[] => {
  // Generate all weeks for the year
  const allWeeks = generateAllWeeksForYear(year);

  // Get quarter date range
  const quarterWeekStartNumbers = getQuarterWeekStartNumbers(year)[quarter];
  assert(quarterWeekStartNumbers, 'Quarter week start number not found');
  const nextQuarterWeekStartNumbers = getQuarterWeekStartNumbers(year)[quarter + 1];

  // Filter weeks that belong to the quarter
  const quarterWeeks = allWeeks.filter((week) => {
    return (
      week.weekNumber >= quarterWeekStartNumbers &&
      (!nextQuarterWeekStartNumbers || week.weekNumber < nextQuarterWeekStartNumbers)
    );
  });

  return quarterWeeks;
};
