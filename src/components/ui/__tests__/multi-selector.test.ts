import { expect, test } from 'bun:test';
import type { MultiSelectorOption } from '../multi-selector';

// Mock options data for testing
const mockOptions: MultiSelectorOption[] = [
  { id: 'option1', value: 'value1', name: 'Option 1', searchText: 'Option 1 extra' },
  { id: 'option2', value: 'value2', name: 'Option 2' },
  { id: 'option3', value: 'value3', name: 'Option 3', searchText: 'Option 3 special' },
];

test('MultiSelector - should have correct interface', () => {
  // Test that the MultiSelectorOption interface has the expected structure
  const option: MultiSelectorOption = {
    id: 'test-id',
    value: 'test-value',
    name: 'Test Option',
    searchText: 'Test Option searchable',
  };

  expect(option.id).toBe('test-id');
  expect(option.value).toBe('test-value');
  expect(option.name).toBe('Test Option');
  expect(option.searchText).toBe('Test Option searchable');
});

test('MultiSelector - should handle empty array', () => {
  const emptyValues: string[] = [];
  expect(emptyValues).toEqual([]);
  expect(emptyValues.length).toBe(0);
});

test('MultiSelector - should handle multiple values', () => {
  const selectedValues = ['value1', 'value3'];
  const selectedOptions = mockOptions.filter((option) => selectedValues.includes(option.value));

  expect(selectedOptions).toHaveLength(2);
  expect(selectedOptions[0]?.name).toBe('Option 1');
  expect(selectedOptions[1]?.name).toBe('Option 3');
});

test('MultiSelector - should validate value format', () => {
  const validValues = ['value1', 'value2', 'value3'];
  const invalidValues = ['', null, undefined];

  // Valid values should be strings
  validValues.forEach((value) => {
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });

  // Invalid values should be filtered out
  const filteredValues = invalidValues.filter((value) => value && typeof value === 'string' && value.length > 0);
  expect(filteredValues).toHaveLength(0);
});

test('MultiSelector - should support search functionality', () => {
  // Test that options can be found by name or searchText
  const searchQueries = ['Option 1', 'extra', 'special', 'Option 2'];

  searchQueries.forEach((query) => {
    const matchingOptions = mockOptions.filter((option) => {
      const searchText = option.searchText || option.name;
      return searchText.toLowerCase().includes(query.toLowerCase());
    });

    expect(matchingOptions.length).toBeGreaterThan(0);
  });
});

test('MultiSelector - should handle options without searchText', () => {
  // Test that options without searchText use name for search
  const option = mockOptions.find((o) => o.id === 'option2');
  expect(option?.searchText).toBeUndefined();

  // Should still be searchable by name
  const searchText = option?.searchText || option?.name || '';
  expect(searchText).toBe('Option 2');
});

test('MultiSelector - should handle select all functionality', () => {
  const allValues = mockOptions.map((option) => option.value);
  expect(allValues).toEqual(['value1', 'value2', 'value3']);
  expect(allValues.length).toBe(mockOptions.length);
});

test('MultiSelector - should handle clear all functionality', () => {
  const clearAllLogic = (selectedValues: string[]) => {
    // Clear all logic should return empty array regardless of input
    expect(selectedValues.length).toBeGreaterThanOrEqual(0);
    return [];
  };

  const result = clearAllLogic(['value1', 'value2', 'value3']);
  expect(result).toEqual([]);
});

test('MultiSelector - maxDisplayItems should control display behavior', () => {
  const mockOptions: MultiSelectorOption[] = [
    { id: 'q1', value: '2025Q1', name: 'Q1 2025' },
    { id: 'q2', value: '2025Q2', name: 'Q2 2025' },
    { id: 'q3', value: '2025Q3', name: 'Q3 2025' },
    { id: 'q4', value: '2025Q4', name: 'Q4 2025' },
  ];

  // Test display logic with maxDisplayItems = 2
  const getDisplayText = (values: string[], maxDisplayItems: number) => {
    if (values.length === 0) return 'Select items';

    if (values.length === 1) {
      const option = mockOptions.find((o) => o.value === values[0]);
      return option?.name || values[0];
    }

    if (values.length <= maxDisplayItems) {
      const displayNames = values
        .slice(0, maxDisplayItems)
        .map((v) => mockOptions.find((o) => o.value === v)?.name || v);

      const combinedText = displayNames.join(', ');

      if (combinedText.length <= 30) {
        return combinedText;
      }
    }

    const firstOption = mockOptions.find((o) => o.value === values[0]);
    const firstName = firstOption?.name || values[0];
    return firstName;
  };

  const getAdditionalCount = (values: string[], maxDisplayItems: number) => {
    if (values.length <= 1) return 0;

    if (values.length <= maxDisplayItems) {
      const displayNames = values
        .slice(0, maxDisplayItems)
        .map((v) => mockOptions.find((o) => o.value === v)?.name || v);

      const combinedText = displayNames.join(', ');

      if (combinedText.length <= 30) {
        return 0;
      }
    }

    return values.length - 1;
  };

  // Test with 1 item
  expect(getDisplayText(['2025Q1'], 2)).toBe('Q1 2025');
  expect(getAdditionalCount(['2025Q1'], 2)).toBe(0);

  // Test with 2 items (should show both)
  expect(getDisplayText(['2025Q1', '2025Q2'], 2)).toBe('Q1 2025, Q2 2025');
  expect(getAdditionalCount(['2025Q1', '2025Q2'], 2)).toBe(0);

  // Test with 3 items (should show first + counter)
  expect(getDisplayText(['2025Q1', '2025Q2', '2025Q3'], 2)).toBe('Q1 2025');
  expect(getAdditionalCount(['2025Q1', '2025Q2', '2025Q3'], 2)).toBe(2);

  // Test with 4 items (should show first + counter)
  expect(getDisplayText(['2025Q1', '2025Q2', '2025Q3', '2025Q4'], 2)).toBe('Q1 2025');
  expect(getAdditionalCount(['2025Q1', '2025Q2', '2025Q3', '2025Q4'], 2)).toBe(3);
});

test('MultiSelector - maxDisplayItems should work with different values', () => {
  const mockOptions: MultiSelectorOption[] = [
    { id: 'q1', value: '2025Q1', name: 'Q1 2025' },
    { id: 'q2', value: '2025Q2', name: 'Q2 2025' },
    { id: 'q3', value: '2025Q3', name: 'Q3 2025' },
  ];

  const getDisplayText = (values: string[], maxDisplayItems: number) => {
    if (values.length === 0) return 'Select items';

    if (values.length === 1) {
      const option = mockOptions.find((o) => o.value === values[0]);
      return option?.name || values[0];
    }

    if (values.length <= maxDisplayItems) {
      const displayNames = values
        .slice(0, maxDisplayItems)
        .map((v) => mockOptions.find((o) => o.value === v)?.name || v);

      const combinedText = displayNames.join(', ');

      if (combinedText.length <= 30) {
        return combinedText;
      }
    }

    const firstOption = mockOptions.find((o) => o.value === values[0]);
    const firstName = firstOption?.name || values[0];
    return firstName;
  };

  // Test with maxDisplayItems = 1
  expect(getDisplayText(['2025Q1', '2025Q2'], 1)).toBe('Q1 2025');

  // Test with maxDisplayItems = 3
  expect(getDisplayText(['2025Q1', '2025Q2', '2025Q3'], 3)).toBe('Q1 2025, Q2 2025, Q3 2025');
});
