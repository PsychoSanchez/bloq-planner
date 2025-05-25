import { Assignment, Assignee, PlannerData, Project, WeekData } from './types';

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

  // Adjust to the closest previous Monday (week start)
  const startDate = new Date(quarterStart);
  const dayOfWeek = startDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

  // Adjust to Monday: if it's Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  if (daysToSubtract > 0) {
    startDate.setDate(startDate.getDate() - daysToSubtract);
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
    return diffWeeks + 2; // +2 because week 1 is the short week before first Monday
  };

  // Generate approximately 13 weeks (one quarter)
  const weeksCount = getWeeksInQuarter();

  for (let i = 0; i < weeksCount; i++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + i * 7);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    weeks.push({
      weekNumber: getWeekNumber(weekStartDate),
      startDate: formatDateToYMD(weekStartDate),
      endDate: formatDateToYMD(weekEndDate),
    });
  }

  return weeks;
};

const assignees: Assignee[] = [
  { id: '1', name: 'Alexander Aronov', type: 'person', role: 'engineering' },
  { id: '2', name: 'Pedro Sousa', type: 'person', role: 'engineering' },
  { id: '3', name: 'Meiko Udras', type: 'person', role: 'design' },
  { id: '4', name: 'Dmitry Mfitonov', type: 'person', role: 'engineering' },
  { id: '5', name: 'Yordan Kalman', type: 'person', role: 'product_management' },
  { id: '6', name: 'Fedor Tkachenko', type: 'person', role: 'engineering' },
  { id: '7', name: 'Aleh Zibrou', type: 'person', role: 'qa' },
  { id: '8', name: 'Sergey Rubtsovenko', type: 'person', role: 'engineering' },
  { id: '9', name: 'Maryam Heravi', type: 'person', role: 'analytics' },
  { id: '10', name: 'Alexander Stolnikov', type: 'person', role: 'data_science' },
  { id: '11', name: 'Eater Selection', type: 'event' },
  { id: '12', name: 'Eater Discovery', type: 'event' },
  { id: '13', name: 'Eater Growth', type: 'event' },
  { id: '14', name: 'Delivery Incentives', type: 'event' },
  { id: '15', name: 'Delivery Courier', type: 'event' },
  { id: '16', name: 'Delivery Order', type: 'event' },
  { id: '17', name: 'Eater App Releases', type: 'event' },
  { id: '18', name: 'A/B Test Config', type: 'event' },
  { id: '19', name: 'A/B Test Analysis', type: 'event' },
];

const projects: Project[] = [
  { id: '1', name: 'SMCBS', slug: 'smcbs', type: 'regular' },
  { id: '2', name: 'TABS', slug: 'tabs', type: 'regular' },
  { id: '3', name: 'ORDER-RS', slug: 'order-rs', type: 'regular' },
  { id: '4', name: 'ACT-AA', slug: 'act-aa', type: 'regular' },
  { id: '5', name: 'ACT-ING', slug: 'act-ing', type: 'regular' },
  { id: '6', name: 'RSV2', slug: 'rsv2', type: 'regular' },
  { id: '7', name: 'CRV2', slug: 'crv2', type: 'regular' },
  { id: '8', name: 'RELATED', slug: 'related', type: 'regular' },
  { id: '9', name: 'QUALITY', slug: 'quality', type: 'regular' },
  { id: '10', name: 'SMC-INC', slug: 'smc-inc', type: 'regular' },
  { id: '11', name: 'MLSORT', slug: 'mlsort', type: 'regular' },
  { id: '12', name: 'EATER HACK', slug: 'eater-hack', type: 'hack' },
  { id: '13', name: 'SPILLOVER', slug: 'spillover', type: 'spillover' },
  { id: '14', name: 'TABS/RSV2', slug: 'tabs-rsv2', type: 'regular' },
  { id: '15', name: 'TECH DEBT', slug: 'tech-debt', type: 'tech-debt' },
  { id: '16', name: 'TEAM EVENT', slug: 'team-event', type: 'team-event' },
  { id: '17', name: 'BLOCKED', slug: 'blocked', type: 'blocked' },
  { id: '18', name: 'OUT SICK', slug: 'out-sick', type: 'sick-leave' },
  { id: '19', name: 'VACATION', slug: 'vacation', type: 'vacation' },
  { id: '20', name: 'ONBOARDING', slug: 'onboarding', type: 'onboarding' },
  { id: '21', name: 'TEAM DUTY', slug: 'team-duty', type: 'duty' },
  { id: '22', name: 'RISK ALERT', slug: 'risk-alert', type: 'risky-week' },
];

// Generate sample assignments for a set of weeks
const generateAssignments = (weeks: WeekData[], year: number, quarter: number): Assignment[] => {
  const assignments: Assignment[] = [];
  let id = 1;

  // This is a simplified generation - in a real app, you'd want more accurate data
  for (const assignee of assignees) {
    for (const week of weeks) {
      // Only generate assignments for some weeks (random)
      if (Math.random() > 0.4) {
        // Occasionally assign one of the new types (sick-leave, vacation, etc.)
        let projectId: string;
        const randomValue = Math.random();

        if (randomValue > 0.9) {
          // Assign sick-leave (10% chance)
          projectId = '18';
        } else if (randomValue > 0.8) {
          // Assign vacation (10% chance)
          projectId = '19';
        } else if (randomValue > 0.78 && assignee.type === 'person') {
          // Assign onboarding (2% chance, only for people)
          projectId = '20';
        } else if (randomValue > 0.75) {
          // Assign duty (3% chance)
          projectId = '21';
        } else if (randomValue > 0.72) {
          // Assign risky week (3% chance)
          projectId = '22';
        } else {
          // Regular project assignment
          projectId = (Math.floor(Math.random() * 17) + 1).toString();
        }

        assignments.push({
          id: id.toString(),
          assigneeId: assignee.id,
          projectId,
          week: week.weekNumber,
          year,
          quarter,
          plannerId: '1',
        });

        id++;
      }
    }
  }

  return assignments;
};

export const getSampleData = (year: number = 2024, quarter: number = 2): PlannerData => {
  const weeks = generateWeeks(year, quarter);
  const assignments = generateAssignments(weeks, year, quarter);

  return {
    assignees,
    projects,
    assignments,
  };
};
