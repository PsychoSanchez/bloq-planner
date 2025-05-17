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
  slug: string;
  icon?: string;
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
  createdAt?: string;
  updatedAt?: string;
  dependencies?: Array<{
    team: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    description: string;
  }>;
  roi?: number;
  impact?: number;
  cost?: number;
  estimates?: Array<{
    department: string; // engineering, design, product, ds, analytics, etc.
    value: number;
  }>;
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
