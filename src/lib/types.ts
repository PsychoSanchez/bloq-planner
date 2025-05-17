export interface Assignee {
  id: string;
  name: string;
  type: 'person' | 'team' | 'dependency' | 'event';
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  type:
    | 'regular'
    | 'tech-debt'
    | 'team-event'
    | 'spillover'
    | 'blocked'
    | 'hack'
    | 'sick-leave'
    | 'vacation'
    | 'onboarding'
    | 'duty'
    | 'risky-week';
  color?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  teamId?: string;
  leadId?: string;
  area?: string;
  dependencies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: string;
  assigneeId: string;
  projectId: string;
  weekId: number;
  status?: string;
}

export interface PlannerData {
  weeks: WeekData[];
  assignees: Assignee[];
  projects: Project[];
  assignments: Assignment[];
}
