import { expect, test, describe } from 'bun:test';
import { DEFAULT_PROJECTS, getAllAvailableProjects, isDefaultProject } from '../constants/default-projects';
import { Project } from '../types';

describe('Default Projects', () => {
  test('should have correct default projects defined', () => {
    expect(DEFAULT_PROJECTS).toHaveLength(4);

    const projectNames = DEFAULT_PROJECTS.map((p) => p.name);
    expect(projectNames).toContain('Vacation');
    expect(projectNames).toContain('Duty');
    expect(projectNames).toContain('Sick Leave');
    expect(projectNames).toContain('Team Event');
  });

  test('should have correct structure for default projects', () => {
    DEFAULT_PROJECTS.forEach((project) => {
      expect(project.id).toMatch(/^default-/);
      expect(project.name).toBeTruthy();
      expect(project.slug).toBeTruthy();
      expect(project.type).toBeTruthy();
      expect(project.color).toBeTruthy();
      expect(project.icon).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.priority).toBeTruthy();
    });
  });

  test('isDefaultProject should correctly identify default projects', () => {
    expect(isDefaultProject('default-vacation')).toBe(true);
    expect(isDefaultProject('default-duty')).toBe(true);
    expect(isDefaultProject('default-sick-leave')).toBe(true);
    expect(isDefaultProject('default-team-event')).toBe(true);

    expect(isDefaultProject('regular-project-id')).toBe(false);
    expect(isDefaultProject('some-other-id')).toBe(false);
    expect(isDefaultProject('')).toBe(false);
  });

  test('getAllAvailableProjects should combine regular and default projects', () => {
    const regularProjects: Project[] = [
      {
        id: 'regular-1',
        name: 'Regular Project 1',
        slug: 'regular-project-1',
        type: 'regular',
      },
      {
        id: 'regular-2',
        name: 'Regular Project 2',
        slug: 'regular-project-2',
        type: 'regular',
      },
    ];

    const allProjects = getAllAvailableProjects(regularProjects);

    expect(allProjects).toHaveLength(regularProjects.length + DEFAULT_PROJECTS.length);

    // Should contain all regular projects
    regularProjects.forEach((project) => {
      expect(allProjects.find((p) => p.id === project.id)).toBeTruthy();
    });

    // Should contain all default projects
    DEFAULT_PROJECTS.forEach((project) => {
      expect(allProjects.find((p) => p.id === project.id)).toBeTruthy();
    });
  });

  test('getAllAvailableProjects should work with empty regular projects', () => {
    const allProjects = getAllAvailableProjects([]);

    expect(allProjects).toHaveLength(DEFAULT_PROJECTS.length);
    expect(allProjects).toEqual(DEFAULT_PROJECTS);
  });

  test('default projects should have unique IDs', () => {
    const ids = DEFAULT_PROJECTS.map((p) => p.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  test('default projects should have appropriate types', () => {
    const vacationProject = DEFAULT_PROJECTS.find((p) => p.name === 'Vacation');
    expect(vacationProject?.type).toBe('vacation');

    const dutyProject = DEFAULT_PROJECTS.find((p) => p.name === 'Duty');
    expect(dutyProject?.type).toBe('duty');

    const sickLeaveProject = DEFAULT_PROJECTS.find((p) => p.name === 'Sick Leave');
    expect(sickLeaveProject?.type).toBe('sick-leave');

    const teamEventProject = DEFAULT_PROJECTS.find((p) => p.name === 'Team Event');
    expect(teamEventProject?.type).toBe('team-event');
  });
});
