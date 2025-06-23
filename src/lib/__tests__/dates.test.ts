import { expect, test } from 'bun:test';
import { generateWeeks } from '../dates';

test('generateWeeks should generate the correct number of weeks', () => {
  const weeks = generateWeeks(2025, 1);
  expect(weeks.length).toBe(13);
  expect(weeks[0]?.weekNumber).toBe(1);
  expect(weeks[12]?.weekNumber).toBe(13);
});

test('generateWeeks should generate the correct number of weeks for Q2', () => {
  const weeks = generateWeeks(2025, 2);
  expect(weeks.length).toBe(13);
  expect(weeks[0]?.weekNumber).toBe(14);
});

test('generateWeeks should show detailed week numbers for Q1 and Q2 2025', () => {
  console.log('\n=== Detailed Week Analysis from dates.ts ===');

  // Test Q1 2025
  const q1Weeks = generateWeeks(2025, 1);
  console.log(
    'Q1 2025 week numbers:',
    q1Weeks.map((w) => w.weekNumber),
  );
  console.log('Q1 2025 first week details:', q1Weeks[0]);
  console.log('Q1 2025 last week details:', q1Weeks[q1Weeks.length - 1]);

  // Test Q2 2025
  const q2Weeks = generateWeeks(2025, 2);
  console.log(
    'Q2 2025 week numbers:',
    q2Weeks.map((w) => w.weekNumber),
  );
  console.log('Q2 2025 first week details:', q2Weeks[0]);
  console.log('Q2 2025 last week details:', q2Weeks[q2Weeks.length - 1]);

  // Check if Q2 starts with week 14 as expected
  expect(q2Weeks[0]?.weekNumber).toBe(14);
});
