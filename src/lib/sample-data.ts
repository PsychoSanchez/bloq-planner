import { Assignment, Assignee, PlannerData, Project, WeekData } from './types';

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

  // Adjust to the closest previous Sunday (week start)
  const startDate = new Date(quarterStart);
  const dayOfWeek = startDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
  if (dayOfWeek > 0) {
    startDate.setDate(startDate.getDate() - dayOfWeek);
  }

  // Get week number of the first week
  const firstWeekNumber =
    Math.ceil((startDate.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  // Generate approximately 13 weeks (one quarter)
  const weeksCount = getWeeksInQuarter();

  for (let i = 0; i < weeksCount; i++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + i * 7);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    weeks.push({
      weekNumber: firstWeekNumber + i,
      startDate: weekStartDate.toISOString().split('T')[0],
      endDate: weekEndDate.toISOString().split('T')[0],
    });
  }

  return weeks;
};

const assignees: Assignee[] = [
  { id: '1', name: 'Alexander Aronov', type: 'person' },
  { id: '2', name: 'Pedro Sousa', type: 'person' },
  { id: '3', name: 'Meiko Udras', type: 'person' },
  { id: '4', name: 'Dmitry Mfitonov', type: 'person' },
  { id: '5', name: 'Yordan Kalman', type: 'person' },
  { id: '6', name: 'Fedor Tkachenko', type: 'person' },
  { id: '7', name: 'Aleh Zibrou', type: 'person' },
  { id: '8', name: 'Sergey Rubtsovenko', type: 'person' },
  { id: '9', name: 'Maryam Heravi', type: 'person' },
  { id: '10', name: 'Alexander Stolnikov', type: 'person' },
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
const generateAssignments = (weeks: WeekData[]): Assignment[] => {
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
          weekId: week.weekNumber,
        });

        id++;
      }
    }
  }

  return assignments;
};

export const getSampleData = (year: number = 2024, quarter: number = 2): PlannerData => {
  const weeks = generateWeeks(year, quarter);
  const assignments = generateAssignments(weeks);

  return {
    weeks,
    assignees,
    projects,
    assignments,
  };
};
