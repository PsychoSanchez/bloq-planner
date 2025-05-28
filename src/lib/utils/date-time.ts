// Utility functions for current date and week detection
export const isCurrentWeek = (weekStartDate: string, weekEndDate: string): boolean => {
  const now = new Date();
  const start = new Date(weekStartDate);
  const end = new Date(weekEndDate);

  // Set end date to end of day (23:59:59.999) to include the entire end day
  end.setHours(23, 59, 59, 999);

  return now >= start && now <= end;
};

export const isCurrentDate = (weekStartDate: string, weekEndDate: string): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(weekStartDate);
  const end = new Date(weekEndDate);

  // Set end date to end of day to include the entire end day
  end.setHours(23, 59, 59, 999);

  return today >= start && today <= end;
};

// Calculate the position of current day within the week (0-6, Monday to Sunday)
export const getCurrentDayPositionInWeek = (weekStartDate: string): number => {
  const now = new Date();
  const start = new Date(weekStartDate);

  // Ensure we're comparing dates at midnight to avoid time zone issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  const diffTime = today.getTime() - weekStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Clamp between 0-6 (Monday to Sunday)
  return Math.max(0, Math.min(6, diffDays));
};

// Calculate the exact position within the day (0-1, representing progress through the day)
export const getCurrentTimePositionInDay = (): number => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return (hours * 60 + minutes) / (24 * 60); // 0 = start of day, 1 = end of day
};
