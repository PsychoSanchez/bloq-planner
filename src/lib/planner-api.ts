import { Planner, Assignment, PlannerCreateData } from './types';

// API response types
export interface PlannersResponse {
  planners: Planner[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  plannerId?: string;
  error?: string;
}

// Type for updating planner that matches the API route expectations
export interface PlannerUpdateData {
  name: string;
  projects: string[];
  assignees: string[];
}

/**
 * Fetch all planners
 */
export async function getPlanners(year?: number, quarter?: number): Promise<{ planners: Planner[] }> {
  let url = '/api/planner';

  // Add query parameters if provided
  if (year || quarter) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (quarter) params.append('quarter', quarter.toString());
    url = `${url}?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch planners: ${response.statusText}`);
  }

  const planners = await response.json();
  return { planners };
}

/**
 * Fetch a specific planner by ID
 */
export async function getPlanner(id: string, year?: number, quarter?: number): Promise<Planner> {
  let url = `/api/planner/${id}`;

  // Add query parameters if provided
  if (year || quarter) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (quarter) params.append('quarter', quarter.toString());
    url = `${url}?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch planner: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new planner
 */
export async function createPlanner(
  year: number,
  quarter: number,
  plannerData: Partial<PlannerCreateData>,
): Promise<ApiResponse> {
  const response = await fetch('/api/planner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Planner Q${quarter} ${year}`,
      assignees: plannerData.assignees || [],
      projects: plannerData.projects || [],
      assignments: plannerData.assignments || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create planner: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    success: !!data.id,
    plannerId: data.id,
  };
}

/**
 * Update an existing planner
 */
export async function updatePlanner(id: string, updates: PlannerUpdateData): Promise<ApiResponse> {
  const response = await fetch(`/api/planner/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update planner: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    success: true,
    plannerId: data.id,
  };
}

/**
 * Delete a planner by ID
 */
export async function deletePlanner(id: string): Promise<ApiResponse> {
  const response = await fetch(`/api/planner/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete planner: ${response.statusText}`);
  }

  return {
    success: true,
  };
}

/**
 * Fetch assignments with optional filtering
 */
export async function getAssignments(params: {
  year?: number;
  quarter?: number;
  assigneeId?: string;
  projectId?: string;
}): Promise<Assignment[]> {
  const queryParams = new URLSearchParams();

  if (params.year) queryParams.append('year', params.year.toString());
  if (params.quarter) queryParams.append('quarter', params.quarter.toString());
  if (params.assigneeId) queryParams.append('assigneeId', params.assigneeId);
  if (params.projectId) queryParams.append('projectId', params.projectId);

  const url = `/api/assignments?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch assignments: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new assignment
 */
export async function createAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
  const response = await fetch('/api/assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignment),
  });

  if (!response.ok) {
    throw new Error(`Failed to create assignment: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing assignment
 */
export async function updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
  const response = await fetch(`/api/assignments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update assignment: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/assignments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete assignment: ${response.statusText}`);
  }

  return response.json();
}
