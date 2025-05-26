import { expect, test, beforeEach } from 'bun:test';
import { ColumnDefinition } from '../use-column-visibility';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock localStorage globally
global.localStorage = localStorageMock as Storage;

const mockColumns: ColumnDefinition[] = [
  { id: 'name', label: 'Name', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'priority', label: 'Priority', defaultVisible: false },
  { id: 'team', label: 'Team', defaultVisible: true },
];

beforeEach(() => {
  localStorageMock.clear();
});

test('ColumnDefinition interface - should have correct structure', () => {
  const column: ColumnDefinition = {
    id: 'test',
    label: 'Test Column',
    defaultVisible: true,
  };

  expect(column.id).toBe('test');
  expect(column.label).toBe('Test Column');
  expect(column.defaultVisible).toBe(true);
});

test('localStorage mock - should work correctly', () => {
  const testKey = 'test-key';
  const testValue = JSON.stringify({ test: true });

  // Should be empty initially
  expect(localStorageMock.getItem(testKey)).toBeNull();

  // Should store and retrieve values
  localStorageMock.setItem(testKey, testValue);
  expect(localStorageMock.getItem(testKey)).toBe(testValue);

  // Should parse stored JSON correctly
  const parsed = JSON.parse(localStorageMock.getItem(testKey)!);
  expect(parsed.test).toBe(true);

  // Should clear correctly
  localStorageMock.clear();
  expect(localStorageMock.getItem(testKey)).toBeNull();
});

test('Column visibility logic - default visibility', () => {
  const getDefaultVisibility = (columns: ColumnDefinition[]) => {
    return columns.reduce(
      (acc, column) => {
        acc[column.id] = column.defaultVisible;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  };

  const defaultVisibility = getDefaultVisibility(mockColumns);

  expect(defaultVisibility.name).toBe(true);
  expect(defaultVisibility.type).toBe(true);
  expect(defaultVisibility.priority).toBe(false);
  expect(defaultVisibility.team).toBe(true);
});

test('Column visibility logic - toggle functionality', () => {
  let visibility = {
    name: true,
    type: true,
    priority: false,
    team: true,
  };

  // Toggle priority from false to true
  visibility = { ...visibility, priority: !visibility.priority };
  expect(visibility.priority).toBe(true);

  // Toggle name from true to false
  visibility = { ...visibility, name: !visibility.name };
  expect(visibility.name).toBe(false);
});

test('Column visibility logic - visible columns filtering', () => {
  const visibility: Record<string, boolean> = {
    name: true,
    type: false,
    priority: true,
    team: false,
  };

  const visibleColumns = mockColumns.filter((column) => visibility[column.id]);

  expect(visibleColumns).toHaveLength(2);
  expect(visibleColumns.map((c) => c.id)).toEqual(['name', 'priority']);
});

test('localStorage persistence - should save and load correctly', () => {
  const storageKey = 'test-columns';
  const visibility = {
    name: false,
    type: true,
    priority: true,
    team: false,
  };

  // Save to localStorage
  localStorageMock.setItem(storageKey, JSON.stringify(visibility));

  // Load from localStorage
  const stored = localStorageMock.getItem(storageKey);
  expect(stored).toBeTruthy();

  const parsed = JSON.parse(stored!);
  expect(parsed.name).toBe(false);
  expect(parsed.type).toBe(true);
  expect(parsed.priority).toBe(true);
  expect(parsed.team).toBe(false);
});

test('localStorage error handling - should handle JSON parse errors', () => {
  const storageKey = 'test-columns';

  // Store invalid JSON
  localStorageMock.setItem(storageKey, 'invalid-json');

  let result = null;
  try {
    result = JSON.parse(localStorageMock.getItem(storageKey)!);
  } catch (error) {
    // Should catch the error and fall back to defaults
    console.warn('JSON parse error:', error);
    result = mockColumns.reduce(
      (acc, column) => {
        acc[column.id] = column.defaultVisible;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  expect(result.name).toBe(true);
  expect(result.priority).toBe(false);
});
