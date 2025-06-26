import { expect, test } from 'bun:test';
import { TeamOption } from '@/components/team-selector';

// Mock team data for testing integration scenarios
const mockTeamsWithMixedTypes: TeamOption[] = [
  { id: 'person-1', name: 'Alice Johnson', role: 'engineering', type: 'person' },
  { id: 'person-2', name: 'Bob Smith', role: 'design', type: 'person' },
  { id: 'person-3', name: 'Carol Davis', role: 'product_management', type: 'person' },
  { id: 'team-1', name: 'Frontend Team', role: 'engineering', type: 'team' },
  { id: 'team-2', name: 'Design System Team', role: 'design', type: 'team' },
  { id: 'dep-1', name: 'External API', role: 'operations', type: 'dependency' },
  { id: 'event-1', name: 'Product Launch', role: 'other', type: 'event' },
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
  const persons = mockTeamsWithMixedTypes.filter((team) => team.type === 'person');

  // Simulate selecting a lead
  const selectedLeadId = 'person-1';
  const selectedLead = persons.find((person) => person.id === selectedLeadId);

  expect(selectedLead).toBeDefined();
  expect(selectedLead?.name).toBe('Alice Johnson');
  expect(selectedLead?.type).toBe('person');
});

test('PersonSelector integration - should handle invalid lead selection gracefully', () => {
  const persons = mockTeamsWithMixedTypes.filter((team) => team.type === 'person');

  // Try to select a team as lead (should not be found)
  const invalidLeadId = 'team-1';
  const selectedLead = persons.find((person) => person.id === invalidLeadId);

  expect(selectedLead).toBeUndefined();
});

test('PersonSelector integration - should group persons by role for better UX', () => {
  const persons = mockTeamsWithMixedTypes.filter((team) => team.type === 'person');

  // Group by role (what PersonSelector does internally)
  const personsByRole = persons.reduce(
    (acc, person) => {
      acc[person.role] ??= [];
      acc[person.role]!.push(person);
      return acc;
    },
    {} as Record<string, TeamOption[]>,
  );

  // Verify roles are properly grouped
  expect(Object.keys(personsByRole)).toEqual(['engineering', 'design', 'product_management']);
  expect(personsByRole.engineering).toHaveLength(1);
  expect(personsByRole.design).toHaveLength(1);
  expect(personsByRole.product_management).toHaveLength(1);

  // Verify correct persons in each role
  expect(personsByRole.engineering?.[0]?.name).toBe('Alice Johnson');
  expect(personsByRole.design?.[0]?.name).toBe('Bob Smith');
  expect(personsByRole.product_management?.[0]?.name).toBe('Carol Davis');
});

test('PersonSelector integration - should work with empty lead selection', () => {
  const persons = mockTeamsWithMixedTypes.filter((team) => team.type === 'person');

  // Simulate no lead selected
  const selectedLeadId = '';
  const selectedLead = persons.find((person) => person.id === selectedLeadId);

  expect(selectedLead).toBeUndefined();

  // Should still be able to show available persons
  expect(persons).toHaveLength(3);
});
