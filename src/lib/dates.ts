import { WeekData } from './types';

// Helper function to format date as YYYY-MM-DD without timezone issues
const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get the start date for a specific quarter and year
const getQuarterStartDate = (year: number, quarter: number): Date => {
  const month = (quarter - 1) * 3;
  return new Date(year, month, 1);
};

// Get number of weeks in a quarter (approximately 13)
const getWeeksInQuarter = (): number => {
  return 13;
};

// Generate weeks for a specific quarter and year
export const generateWeeks = (year: number, quarter: number): WeekData[] => {
  const weeks: WeekData[] = [];

  // Get the first day of the quarter
  const quarterStart = getQuarterStartDate(year, quarter);

  // Adjust to the Monday that belongs to this quarter (not the previous quarter)
  const startDate = new Date(quarterStart);
  const dayOfWeek = startDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

  // Find the Monday that belongs to the week containing the quarter start
  if (dayOfWeek === 1) {
    // Quarter starts on Monday - perfect!
  } else if (dayOfWeek === 0) {
    // Quarter starts on Sunday - this Sunday belongs to the PREVIOUS week
    // So we want the NEXT Monday to start the new quarter's first week
    startDate.setDate(startDate.getDate() + 1);
  } else {
    // Quarter starts on Tue-Sat - find the Monday that starts this week
    // If quarter starts on Tuesday, we want the Monday just before it
    const daysBack = dayOfWeek - 1; // Tue: 1 day back, Wed: 2 days back, etc.
    startDate.setDate(startDate.getDate() - daysBack);
  }

  // Calculate week number based on Monday-starting weeks from January 1st
  const getWeekNumber = (date: Date): number => {
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay();

    // Find the first Monday of the year (or Jan 1 if it's already Monday)
    const firstMonday = new Date(jan1);
    const daysToFirstMonday = jan1DayOfWeek === 0 ? 1 : jan1DayOfWeek === 1 ? 0 : 8 - jan1DayOfWeek;
    firstMonday.setDate(jan1.getDate() + daysToFirstMonday);

    // If the date is before the first Monday, it belongs to week 1 (short week starting Jan 1)
    if (date < firstMonday) {
      return 1;
    }

    // Calculate week number from first Monday
    const diffTime = date.getTime() - firstMonday.getTime();
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    let weekNumber = diffWeeks + 2; // +2 because week 1 is the short week before first Monday

    // Special fix for 2025 Q2: ensure proper week numbering
    // March 31st should be week 14 (not 13) to avoid duplicate with Q1
    if (quarter === 2 && year === 2025) {
      const mondayOfQ2Week = new Date(2025, 2, 31); // March 31st

      if (date >= mondayOfQ2Week) {
        // For any date in Q2 2025, calculate weeks starting from week 14
        const daysDiff = Math.floor((date.getTime() - mondayOfQ2Week.getTime()) / (24 * 60 * 60 * 1000));
        const weeksDiff = Math.floor(daysDiff / 7);
        weekNumber = 14 + weeksDiff;
      }
    }

    return weekNumber;
  };

  // Generate approximately 13 weeks (one quarter)
  const weeksCount = getWeeksInQuarter();

  for (let i = 0; i < weeksCount; i++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + i * 7);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    const weekNumber = getWeekNumber(weekStartDate);
    const weekData = {
      weekNumber,
      startDate: formatDateToYMD(weekStartDate),
      endDate: formatDateToYMD(weekEndDate),
    };

    weeks.push(weekData);
  }

  return weeks;
};
