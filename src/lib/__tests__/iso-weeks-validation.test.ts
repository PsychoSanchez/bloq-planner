import { expect, test } from 'bun:test';
import { generateAllWeeksForYear, generateWeeks } from '../dates';

// Expected ISO weeks for 2025
const EXPECTED_2025_WEEKS = [
  { week: 1, start: '2024-12-30', end: '2025-01-05' },
  { week: 2, start: '2025-01-06', end: '2025-01-12' },
  { week: 3, start: '2025-01-13', end: '2025-01-19' },
  { week: 4, start: '2025-01-20', end: '2025-01-26' },
  { week: 5, start: '2025-01-27', end: '2025-02-02' },
  { week: 6, start: '2025-02-03', end: '2025-02-09' },
  { week: 7, start: '2025-02-10', end: '2025-02-16' },
  { week: 8, start: '2025-02-17', end: '2025-02-23' },
  { week: 9, start: '2025-02-24', end: '2025-03-02' },
  { week: 10, start: '2025-03-03', end: '2025-03-09' },
  { week: 11, start: '2025-03-10', end: '2025-03-16' },
  { week: 12, start: '2025-03-17', end: '2025-03-23' },
  { week: 13, start: '2025-03-24', end: '2025-03-30' },
  { week: 14, start: '2025-03-31', end: '2025-04-06' },
  { week: 15, start: '2025-04-07', end: '2025-04-13' },
  { week: 16, start: '2025-04-14', end: '2025-04-20' },
  { week: 17, start: '2025-04-21', end: '2025-04-27' },
  { week: 18, start: '2025-04-28', end: '2025-05-04' },
  { week: 19, start: '2025-05-05', end: '2025-05-11' },
  { week: 20, start: '2025-05-12', end: '2025-05-18' },
  { week: 21, start: '2025-05-19', end: '2025-05-25' },
  { week: 22, start: '2025-05-26', end: '2025-06-01' },
  { week: 23, start: '2025-06-02', end: '2025-06-08' },
  { week: 24, start: '2025-06-09', end: '2025-06-15' },
  { week: 25, start: '2025-06-16', end: '2025-06-22' },
  { week: 26, start: '2025-06-23', end: '2025-06-29' },
  { week: 27, start: '2025-06-30', end: '2025-07-06' },
  { week: 28, start: '2025-07-07', end: '2025-07-13' },
  { week: 29, start: '2025-07-14', end: '2025-07-20' },
  { week: 30, start: '2025-07-21', end: '2025-07-27' },
  { week: 31, start: '2025-07-28', end: '2025-08-03' },
  { week: 32, start: '2025-08-04', end: '2025-08-10' },
  { week: 33, start: '2025-08-11', end: '2025-08-17' },
  { week: 34, start: '2025-08-18', end: '2025-08-24' },
  { week: 35, start: '2025-08-25', end: '2025-08-31' },
  { week: 36, start: '2025-09-01', end: '2025-09-07' },
  { week: 37, start: '2025-09-08', end: '2025-09-14' },
  { week: 38, start: '2025-09-15', end: '2025-09-21' },
  { week: 39, start: '2025-09-22', end: '2025-09-28' },
  { week: 40, start: '2025-09-29', end: '2025-10-05' },
  { week: 41, start: '2025-10-06', end: '2025-10-12' },
  { week: 42, start: '2025-10-13', end: '2025-10-19' },
  { week: 43, start: '2025-10-20', end: '2025-10-26' },
  { week: 44, start: '2025-10-27', end: '2025-11-02' },
  { week: 45, start: '2025-11-03', end: '2025-11-09' },
  { week: 46, start: '2025-11-10', end: '2025-11-16' },
  { week: 47, start: '2025-11-17', end: '2025-11-23' },
  { week: 48, start: '2025-11-24', end: '2025-11-30' },
  { week: 49, start: '2025-12-01', end: '2025-12-07' },
  { week: 50, start: '2025-12-08', end: '2025-12-14' },
  { week: 51, start: '2025-12-15', end: '2025-12-21' },
  { week: 52, start: '2025-12-22', end: '2025-12-28' },
];

// Expected ISO weeks for 2026 (53 weeks)
const EXPECTED_2026_WEEKS = [
  { week: 1, start: '2025-12-29', end: '2026-01-04' },
  { week: 2, start: '2026-01-05', end: '2026-01-11' },
  { week: 3, start: '2026-01-12', end: '2026-01-18' },
  { week: 4, start: '2026-01-19', end: '2026-01-25' },
  { week: 5, start: '2026-01-26', end: '2026-02-01' },
  { week: 6, start: '2026-02-02', end: '2026-02-08' },
  { week: 7, start: '2026-02-09', end: '2026-02-15' },
  { week: 8, start: '2026-02-16', end: '2026-02-22' },
  { week: 9, start: '2026-02-23', end: '2026-03-01' },
  { week: 10, start: '2026-03-02', end: '2026-03-08' },
  { week: 11, start: '2026-03-09', end: '2026-03-15' },
  { week: 12, start: '2026-03-16', end: '2026-03-22' },
  { week: 13, start: '2026-03-23', end: '2026-03-29' },
  { week: 14, start: '2026-03-30', end: '2026-04-05' },
  { week: 15, start: '2026-04-06', end: '2026-04-12' },
  { week: 16, start: '2026-04-13', end: '2026-04-19' },
  { week: 17, start: '2026-04-20', end: '2026-04-26' },
  { week: 18, start: '2026-04-27', end: '2026-05-03' },
  { week: 19, start: '2026-05-04', end: '2026-05-10' },
  { week: 20, start: '2026-05-11', end: '2026-05-17' },
  { week: 21, start: '2026-05-18', end: '2026-05-24' },
  { week: 22, start: '2026-05-25', end: '2026-05-31' },
  { week: 23, start: '2026-06-01', end: '2026-06-07' },
  { week: 24, start: '2026-06-08', end: '2026-06-14' },
  { week: 25, start: '2026-06-15', end: '2026-06-21' },
  { week: 26, start: '2026-06-22', end: '2026-06-28' },
  { week: 27, start: '2026-06-29', end: '2026-07-05' },
  { week: 28, start: '2026-07-06', end: '2026-07-12' },
  { week: 29, start: '2026-07-13', end: '2026-07-19' },
  { week: 30, start: '2026-07-20', end: '2026-07-26' },
  { week: 31, start: '2026-07-27', end: '2026-08-02' },
  { week: 32, start: '2026-08-03', end: '2026-08-09' },
  { week: 33, start: '2026-08-10', end: '2026-08-16' },
  { week: 34, start: '2026-08-17', end: '2026-08-23' },
  { week: 35, start: '2026-08-24', end: '2026-08-30' },
  { week: 36, start: '2026-08-31', end: '2026-09-06' },
  { week: 37, start: '2026-09-07', end: '2026-09-13' },
  { week: 38, start: '2026-09-14', end: '2026-09-20' },
  { week: 39, start: '2026-09-21', end: '2026-09-27' },
  { week: 40, start: '2026-09-28', end: '2026-10-04' },
  { week: 41, start: '2026-10-05', end: '2026-10-11' },
  { week: 42, start: '2026-10-12', end: '2026-10-18' },
  { week: 43, start: '2026-10-19', end: '2026-10-25' },
  { week: 44, start: '2026-10-26', end: '2026-11-01' },
  { week: 45, start: '2026-11-02', end: '2026-11-08' },
  { week: 46, start: '2026-11-09', end: '2026-11-15' },
  { week: 47, start: '2026-11-16', end: '2026-11-22' },
  { week: 48, start: '2026-11-23', end: '2026-11-29' },
  { week: 49, start: '2026-11-30', end: '2026-12-06' },
  { week: 50, start: '2026-12-07', end: '2026-12-13' },
  { week: 51, start: '2026-12-14', end: '2026-12-20' },
  { week: 52, start: '2026-12-21', end: '2026-12-27' },
  { week: 53, start: '2026-12-28', end: '2027-01-03' },
];

// Expected ISO weeks for 2027 (52 weeks)
const EXPECTED_2027_WEEKS = [
  { week: 1, start: '2027-01-04', end: '2027-01-10' },
  { week: 2, start: '2027-01-11', end: '2027-01-17' },
  { week: 3, start: '2027-01-18', end: '2027-01-24' },
  { week: 4, start: '2027-01-25', end: '2027-01-31' },
  { week: 5, start: '2027-02-01', end: '2027-02-07' },
  { week: 6, start: '2027-02-08', end: '2027-02-14' },
  { week: 7, start: '2027-02-15', end: '2027-02-21' },
  { week: 8, start: '2027-02-22', end: '2027-02-28' },
  { week: 9, start: '2027-03-01', end: '2027-03-07' },
  { week: 10, start: '2027-03-08', end: '2027-03-14' },
  { week: 11, start: '2027-03-15', end: '2027-03-21' },
  { week: 12, start: '2027-03-22', end: '2027-03-28' },
  { week: 13, start: '2027-03-29', end: '2027-04-04' },
  { week: 14, start: '2027-04-05', end: '2027-04-11' },
  { week: 15, start: '2027-04-12', end: '2027-04-18' },
  { week: 16, start: '2027-04-19', end: '2027-04-25' },
  { week: 17, start: '2027-04-26', end: '2027-05-02' },
  { week: 18, start: '2027-05-03', end: '2027-05-09' },
  { week: 19, start: '2027-05-10', end: '2027-05-16' },
  { week: 20, start: '2027-05-17', end: '2027-05-23' },
  { week: 21, start: '2027-05-24', end: '2027-05-30' },
  { week: 22, start: '2027-05-31', end: '2027-06-06' },
  { week: 23, start: '2027-06-07', end: '2027-06-13' },
  { week: 24, start: '2027-06-14', end: '2027-06-20' },
  { week: 25, start: '2027-06-21', end: '2027-06-27' },
  { week: 26, start: '2027-06-28', end: '2027-07-04' },
  { week: 27, start: '2027-07-05', end: '2027-07-11' },
  { week: 28, start: '2027-07-12', end: '2027-07-18' },
  { week: 29, start: '2027-07-19', end: '2027-07-25' },
  { week: 30, start: '2027-07-26', end: '2027-08-01' },
  { week: 31, start: '2027-08-02', end: '2027-08-08' },
  { week: 32, start: '2027-08-09', end: '2027-08-15' },
  { week: 33, start: '2027-08-16', end: '2027-08-22' },
  { week: 34, start: '2027-08-23', end: '2027-08-29' },
  { week: 35, start: '2027-08-30', end: '2027-09-05' },
  { week: 36, start: '2027-09-06', end: '2027-09-12' },
  { week: 37, start: '2027-09-13', end: '2027-09-19' },
  { week: 38, start: '2027-09-20', end: '2027-09-26' },
  { week: 39, start: '2027-09-27', end: '2027-10-03' },
  { week: 40, start: '2027-10-04', end: '2027-10-10' },
  { week: 41, start: '2027-10-11', end: '2027-10-17' },
  { week: 42, start: '2027-10-18', end: '2027-10-24' },
  { week: 43, start: '2027-10-25', end: '2027-10-31' },
  { week: 44, start: '2027-11-01', end: '2027-11-07' },
  { week: 45, start: '2027-11-08', end: '2027-11-14' },
  { week: 46, start: '2027-11-15', end: '2027-11-21' },
  { week: 47, start: '2027-11-22', end: '2027-11-28' },
  { week: 48, start: '2027-11-29', end: '2027-12-05' },
  { week: 49, start: '2027-12-06', end: '2027-12-12' },
  { week: 50, start: '2027-12-13', end: '2027-12-19' },
  { week: 51, start: '2027-12-20', end: '2027-12-26' },
  { week: 52, start: '2027-12-27', end: '2028-01-02' },
];

test('generateAllWeeksForYear should generate the correct number of weeks for 2025', () => {
  const weeks = generateAllWeeksForYear(2025);
  expect(weeks.length).toEqual(EXPECTED_2025_WEEKS.length);
});

test('generateAllWeeksForYear should generate the correct number of weeks for 2026', () => {
  const weeks = generateAllWeeksForYear(2026);
  expect(weeks.length).toEqual(EXPECTED_2026_WEEKS.length);
});

test('generateAllWeeksForYear should generate the correct number of weeks for 2027', () => {
  const weeks = generateAllWeeksForYear(2027);
  expect(weeks.length).toEqual(EXPECTED_2027_WEEKS.length);
});

test('generateWeeks should generate the correct number of weeks for Q1 2025', () => {
  const weeks = generateWeeks(2025, 1);
  const expectedWeeks = EXPECTED_2025_WEEKS.slice(0, 13);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q2 2025', () => {
  const weeks = generateWeeks(2025, 2);
  const expectedWeeks = EXPECTED_2025_WEEKS.slice(13, 26);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q3 2025', () => {
  const weeks = generateWeeks(2025, 3);
  const expectedWeeks = EXPECTED_2025_WEEKS.slice(26, 39);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q4 2025', () => {
  const weeks = generateWeeks(2025, 4);
  const expectedWeeks = EXPECTED_2025_WEEKS.slice(39, 52);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q1 2026', () => {
  const weeks = generateWeeks(2026, 1);
  const expectedWeeks = EXPECTED_2026_WEEKS.slice(0, 13);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q2 2026', () => {
  const weeks = generateWeeks(2026, 2);
  const expectedWeeks = EXPECTED_2026_WEEKS.slice(13, 26);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q3 2026', () => {
  const weeks = generateWeeks(2026, 3);
  const expectedWeeks = EXPECTED_2026_WEEKS.slice(26, 39);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q4 2026', () => {
  const weeks = generateWeeks(2026, 4);
  const expectedWeeks = EXPECTED_2026_WEEKS.slice(39, 53);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});

test('generateWeeks should generate the correct number of weeks for Q1 2027', () => {
  const weeks = generateWeeks(2027, 1);
  const expectedWeeks = EXPECTED_2027_WEEKS.slice(0, 12);
  expect(weeks).toEqual(
    expectedWeeks.map((week) => ({
      weekNumber: week.week,
      startDate: week.start,
      endDate: week.end,
    })),
  );
});
