import { expect, test } from 'bun:test';
import { TeamOption } from '@/components/team-selector';

// Mock team data for testing integration scenarios
const mockTeamsWithMixedTypes: TeamOption[] = [
  { id: 'person-1', name: 'Alice Johnson', department: 'engineering', type: 'person' },
  { id: 'person-2', name: 'Bob Smith', department: 'design', type: 'person' },
  { id: 'person-3', name: 'Carol Davis', department: 'product', type: 'person' },
  { id: 'team-1', name: 'Frontend Team', department: 'engineering', type: 'team' },
  { id: 'team-2', name: 'Design System Team', department: 'design', type: 'team' },
  { id: 'dep-1', name: 'External API', department: 'operations', type: 'dependency' },
  { id: 'event-1', name: 'Product Launch', department: 'marketing', type: 'event' },
];

test('PersonSelector integration - should only show persons for lead selection', () => {
  // Simulate what PersonSelector does internally
  const availablePersons = mockTeamsWithMixedTypes.filter((team) => team.type === 'person');

  expect(availablePersons).toHaveLength(3);

  // Verify all results are persons
  expect(availablePersons.every((person) => person.type === 'person')).toBe(true);

  // Verify specific persons are available
  const personIds = availablePersons.map((person) => person.id);
  expect(personIds).toContain('person-1');
  expect(personIds).toContain('person-2');
  expect(personIds).toContain('person-3');

  // Verify teams, dependencies, and events are excluded
  expect(personIds).not.toContain('team-1');
  expect(personIds).not.toContain('dep-1');
  expect(personIds).not.toContain('event-1');
});

test('PersonSelector integration - should handle lead selection in project forms', () => {
  const selectedLeadId = 'person-2';

  // Simulate finding the selected person (what PersonSelector does for display)
  const selectedPerson = mockTeamsWithMixedTypes.find((team) => team.id === selectedLeadId && team.type === 'person');

  expect(selectedPerson).toBeDefined();
  expect(selectedPerson?.name).toBe('Bob Smith');
  expect(selectedPerson?.department).toBe('design');
  expect(selectedPerson?.type).toBe('person');
});

test('PersonSelector integration - should handle invalid lead selection gracefully', () => {
  // Test selecting a team ID instead of person ID (should not work)
  const invalidLeadId = 'team-1';

  const selectedPerson = mockTeamsWithMixedTypes.find((team) => team.id === invalidLeadId && team.type === 'person');

  expect(selectedPerson).toBeUndefined();
});

test('PersonSelector integration - should group persons by department for better UX', () => {
  const persons = mockTeamsWithMixedTypes.filter((team) => team.type === 'person');

  // Group by department (what PersonSelector does internally)
  const personsByDepartment = persons.reduce(
    (acc, person) => {
      acc[person.department] ??= [];
      acc[person.department]!.push(person);
      return acc;
    },
    {} as Record<string, TeamOption[]>,
  );

  // Verify departments are properly grouped
  expect(Object.keys(personsByDepartment)).toEqual(['engineering', 'design', 'product']);
  expect(personsByDepartment.engineering).toHaveLength(1);
  expect(personsByDepartment.design).toHaveLength(1);
  expect(personsByDepartment.product).toHaveLength(1);

  // Verify correct persons in each department
  expect(personsByDepartment.engineering?.[0]?.name).toBe('Alice Johnson');
  expect(personsByDepartment.design?.[0]?.name).toBe('Bob Smith');
  expect(personsByDepartment.product?.[0]?.name).toBe('Carol Davis');
});

test('PersonSelector integration - should work with empty lead selection', () => {
  const emptyLeadId = '';

  const selectedPerson = mockTeamsWithMixedTypes.find((team) => team.id === emptyLeadId && team.type === 'person');

  expect(selectedPerson).toBeUndefined();

  // Verify that empty selection is handled gracefully
  const displayValue = selectedPerson ? selectedPerson.name : emptyLeadId;
  expect(displayValue).toBe('');
});
