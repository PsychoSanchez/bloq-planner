import { expect, test } from 'bun:test';
import { TeamOption } from '@/components/team-selector';

// Mock team data for testing
const mockTeams: TeamOption[] = [
  { id: '1', name: 'John Doe', department: 'engineering', type: 'person' },
  { id: '2', name: 'Jane Smith', department: 'design', type: 'person' },
  { id: '3', name: 'Frontend Team', department: 'engineering', type: 'team' },
  { id: '4', name: 'Backend Team', department: 'engineering', type: 'team' },
  { id: '5', name: 'External API', department: 'operations', type: 'dependency' },
  { id: '6', name: 'Alice Johnson', department: 'product', type: 'person' },
];

test('PersonSelector should filter teams to only include persons', () => {
  const persons = mockTeams.filter((team) => team.type === 'person');

  expect(persons).toHaveLength(3);
  expect(persons.every((person) => person.type === 'person')).toBe(true);

  const personNames = persons.map((person) => person.name);
  expect(personNames).toContain('John Doe');
  expect(personNames).toContain('Jane Smith');
  expect(personNames).toContain('Alice Johnson');
});

test('PersonSelector should group persons by department', () => {
  const persons = mockTeams.filter((team) => team.type === 'person');

  const personsByDepartment = persons.reduce(
    (acc, person) => {
      acc[person.department] ??= [];
      acc[person.department]!.push(person);
      return acc;
    },
    {} as Record<string, TeamOption[]>,
  );

  expect(Object.keys(personsByDepartment)).toEqual(['engineering', 'design', 'product']);
  expect(personsByDepartment.engineering).toHaveLength(1);
  expect(personsByDepartment.design).toHaveLength(1);
  expect(personsByDepartment.product).toHaveLength(1);
});

test('PersonSelector should handle empty teams array', () => {
  const emptyTeams: TeamOption[] = [];
  const persons = emptyTeams.filter((team) => team.type === 'person');

  expect(persons).toHaveLength(0);

  const personsByDepartment = persons.reduce(
    (acc, person) => {
      acc[person.department] ??= [];
      acc[person.department]!.push(person);
      return acc;
    },
    {} as Record<string, TeamOption[]>,
  );

  expect(Object.keys(personsByDepartment)).toHaveLength(0);
});

test('PersonSelector should handle teams with no persons', () => {
  const teamsWithoutPersons: TeamOption[] = [
    { id: '1', name: 'Frontend Team', department: 'engineering', type: 'team' },
    { id: '2', name: 'External API', department: 'operations', type: 'dependency' },
  ];

  const persons = teamsWithoutPersons.filter((team) => team.type === 'person');

  expect(persons).toHaveLength(0);

  const personsByDepartment = persons.reduce(
    (acc, person) => {
      acc[person.department] ??= [];
      acc[person.department]!.push(person);
      return acc;
    },
    {} as Record<string, TeamOption[]>,
  );

  expect(Object.keys(personsByDepartment)).toHaveLength(0);
});
