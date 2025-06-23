import { expect, test } from 'bun:test';
import { generateWeeks } from '../dates';

// Expected ISO weeks for 2025 (provided by user)
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

// Expected quarter boundaries for 2025
const EXPECTED_2025_QUARTERS = {
  1: { start: 1, end: 13 }, // Q1: weeks 1-13
  2: { start: 14, end: 26 }, // Q2: weeks 14-26
  3: { start: 27, end: 39 }, // Q3: weeks 27-39
  4: { start: 40, end: 52 }, // Q4: weeks 40-52
};

test('generateWeeks should match expected ISO weeks for 2025', () => {
  console.log('\n🧪 Testing 2025 ISO weeks against expected data...');

  // Test all quarters for 2025
  for (let quarter = 1; quarter <= 4; quarter++) {
    const weeks = generateWeeks(2025, quarter);
    const expectedRange = EXPECTED_2025_QUARTERS[quarter as keyof typeof EXPECTED_2025_QUARTERS];

    console.log(`\n📅 Q${quarter} 2025: weeks ${expectedRange.start}-${expectedRange.end}`);

    // Check we have the right number of weeks
    const expectedWeekCount = expectedRange.end - expectedRange.start + 1;
    expect(weeks.length).toBe(expectedWeekCount);

    // Check each week matches expected data
    weeks.forEach((week, index) => {
      const expectedWeekNumber = expectedRange.start + index;
      const expectedWeek = EXPECTED_2025_WEEKS.find((w) => w.week === expectedWeekNumber);

      expect(week.weekNumber).toBe(expectedWeekNumber);
      expect(week.startDate).toBe(expectedWeek!.start);
      expect(week.endDate).toBe(expectedWeek!.end);

      if (index === 0) {
        console.log(`   First week: #${week.weekNumber} (${week.startDate} to ${week.endDate})`);
      }
      if (index === weeks.length - 1) {
        console.log(`   Last week:  #${week.weekNumber} (${week.startDate} to ${week.endDate})`);
      }
    });
  }

  console.log('✅ All 2025 weeks match expected ISO week data!');
});

test('generateWeeks should have no duplicate weeks between quarters for 2025-2027', () => {
  const testYears = [2025, 2026, 2027];

  for (const year of testYears) {
    console.log(`\n🔍 Testing ${year} for duplicate weeks...`);

    const allWeeks: number[] = [];

    // Collect all week numbers from all quarters
    for (let quarter = 1; quarter <= 4; quarter++) {
      const weeks = generateWeeks(year, quarter);
      weeks.forEach((week) => allWeeks.push(week.weekNumber));
    }

    // Check for duplicates
    const uniqueWeeks = new Set(allWeeks);
    const hasDuplicates = uniqueWeeks.size !== allWeeks.length;

    if (hasDuplicates) {
      const duplicates = allWeeks.filter((week, index) => allWeeks.indexOf(week) !== index);
      console.error(`❌ Found duplicate weeks in ${year}:`, [...new Set(duplicates)]);
    }

    expect(hasDuplicates).toBe(false);
    console.log(`✅ ${year}: No duplicate weeks found (${uniqueWeeks.size} unique weeks)`);
  }
});

test('generateWeeks should have consecutive week numbers within each quarter', () => {
  const testYears = [2025, 2026, 2027];

  for (const year of testYears) {
    console.log(`\n📈 Testing ${year} for consecutive week numbers...`);

    for (let quarter = 1; quarter <= 4; quarter++) {
      const weeks = generateWeeks(year, quarter);
      const weekNumbers = weeks.map((w) => w.weekNumber);

      // Check if consecutive
      for (let i = 1; i < weekNumbers.length; i++) {
        const current = weekNumbers[i]!;
        const previous = weekNumbers[i - 1]!;
        const isConsecutive = current === previous + 1;

        if (!isConsecutive) {
          console.error(`❌ Non-consecutive weeks in Q${quarter} ${year}: ${previous} -> ${current}`);
        }

        expect(isConsecutive).toBe(true);
      }

      console.log(`   Q${quarter}: weeks ${weekNumbers[0]}-${weekNumbers[weekNumbers.length - 1]} ✅`);
    }
  }
});

test('generateWeeks should handle year boundaries correctly', () => {
  console.log('\n📅 Testing year boundary handling...');

  const testCases = [
    { year: 2024, nextYear: 2025 },
    { year: 2025, nextYear: 2026 },
    { year: 2026, nextYear: 2027 },
  ];

  for (const { year, nextYear } of testCases) {
    // Get last quarter of current year and first quarter of next year
    const q4Current = generateWeeks(year, 4);
    const q1Next = generateWeeks(nextYear, 1);

    const lastWeekCurrent = q4Current[q4Current.length - 1]!.weekNumber;
    const firstWeekNext = q1Next[0]!.weekNumber;

    console.log(`${year} Q4 ends with week ${lastWeekCurrent}, ${nextYear} Q1 starts with week ${firstWeekNext}`);

    // First week of new year should be much lower than last week of previous year
    // (accounting for year rollover)
    expect(firstWeekNext).toBeLessThan(lastWeekCurrent);
    expect(firstWeekNext).toBeLessThanOrEqual(13); // First quarter should start with week 1-13
    expect(lastWeekCurrent).toBeGreaterThan(40); // Last quarter should end with week 40+
  }

  console.log('✅ Year boundaries handled correctly!');
});

test('generateWeeks should generate exactly 52 weeks per year for 2025-2027', () => {
  const testYears = [2025, 2026, 2027];

  for (const year of testYears) {
    console.log(`\n📊 Testing total weeks for ${year}...`);

    const allWeeks: { weekNumber: number; startDate: string; endDate: string }[] = [];

    for (let quarter = 1; quarter <= 4; quarter++) {
      const weeks = generateWeeks(year, quarter);
      allWeeks.push(...weeks);
    }

    // Check total number of weeks
    expect(allWeeks.length).toBe(52);

    // Check week number range
    const weekNumbers = allWeeks.map((w) => w.weekNumber).sort((a, b) => a - b);
    const minWeek = Math.min(...weekNumbers);
    const maxWeek = Math.max(...weekNumbers);

    console.log(`   Total weeks: ${allWeeks.length}`);
    console.log(`   Week range: ${minWeek}-${maxWeek}`);

    expect(minWeek).toBe(1);
    expect(maxWeek).toBe(52);

    console.log(`✅ ${year}: 52 weeks generated correctly`);
  }
});

test('generateWeeks should match specific critical dates for 2025', () => {
  console.log('\n🎯 Testing critical quarter boundary dates for 2025...');

  // Test specific quarter boundaries from the expected data
  const criticalTests = [
    { quarter: 1, expectedStart: 1, expectedEnd: 13, lastDate: '2025-03-30' },
    { quarter: 2, expectedStart: 14, expectedEnd: 26, firstDate: '2025-03-31', lastDate: '2025-06-29' },
    { quarter: 3, expectedStart: 27, expectedEnd: 39, firstDate: '2025-06-30', lastDate: '2025-09-28' },
    { quarter: 4, expectedStart: 40, expectedEnd: 52, firstDate: '2025-09-29', lastDate: '2025-12-28' },
  ];

  for (const test of criticalTests) {
    const weeks = generateWeeks(2025, test.quarter);

    // Check week number range
    expect(weeks[0]!.weekNumber).toBe(test.expectedStart);
    expect(weeks[weeks.length - 1]!.weekNumber).toBe(test.expectedEnd);

    // Check specific dates if provided
    if (test.firstDate) {
      expect(weeks[0]!.startDate).toBe(test.firstDate);
    }
    if (test.lastDate) {
      expect(weeks[weeks.length - 1]!.endDate).toBe(test.lastDate);
    }

    console.log(
      `✅ Q${test.quarter}: weeks ${test.expectedStart}-${test.expectedEnd} ` +
        `(${weeks[0]!.startDate} to ${weeks[weeks.length - 1]!.endDate})`,
    );
  }

  console.log('✅ All critical quarter boundaries correct for 2025!');
});

test('generateWeeks should handle Monday-Sunday week structure correctly', () => {
  console.log('\n📅 Testing Monday-Sunday week structure...');

  // Test a few representative weeks from 2025 to ensure Monday-Sunday structure
  const testCases = [
    { quarter: 1, weekIndex: 0 }, // First week of Q1
    { quarter: 2, weekIndex: 0 }, // First week of Q2 (critical boundary)
    { quarter: 3, weekIndex: 5 }, // Mid-quarter week
    { quarter: 4, weekIndex: 12 }, // Last week of Q4
  ];

  for (const { quarter, weekIndex } of testCases) {
    const weeks = generateWeeks(2025, quarter);
    const week = weeks[weekIndex]!;

    const startDate = new Date(week.startDate);
    const endDate = new Date(week.endDate);

    // Monday = 1, Sunday = 0
    const startDayOfWeek = startDate.getDay();
    const endDayOfWeek = endDate.getDay();

    // Week should start on Monday (1) and end on Sunday (0)
    expect(startDayOfWeek).toBe(1); // Monday
    expect(endDayOfWeek).toBe(0); // Sunday

    // Week should be exactly 7 days
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(6); // 6 days difference (Monday to Sunday inclusive)

    console.log(`✅ Week #${week.weekNumber}: ${week.startDate} (Mon) to ${week.endDate} (Sun)`);
  }

  console.log('✅ All weeks follow Monday-Sunday structure!');
});
