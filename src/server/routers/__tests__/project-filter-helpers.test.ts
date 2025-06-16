import { expect, test, describe } from 'bun:test';
import { buildFilterConditions, mergeFilterConditions } from '@/server/shared/mongodb-query-builders';

describe('buildFilterConditions', () => {
  describe('empty input handling', () => {
    test('should return empty array for empty values', () => {
      const result = buildFilterConditions('priority', [], 'simple');
      expect(result).toEqual([]);
    });

    test('should return empty array for all field types with empty values', () => {
      expect(buildFilterConditions('priority', [], 'simple')).toEqual([]);
      expect(buildFilterConditions('quarters', [], 'array')).toEqual([]);
      expect(buildFilterConditions('dependencies.team', [], 'nested')).toEqual([]);
    });
  });

  describe('simple field type', () => {
    test('should build conditions for assigned values only', () => {
      const result = buildFilterConditions('priority', ['high', 'medium'], 'simple');
      expect(result).toEqual([{ priority: { $in: ['high', 'medium'] } }]);
    });

    test('should build conditions for unassigned only', () => {
      const result = buildFilterConditions('priority', ['unassigned'], 'simple');
      expect(result).toEqual([{ priority: { $in: [null, undefined, ''] } }, { priority: { $exists: false } }]);
    });

    test('should build conditions for both assigned and unassigned', () => {
      const result = buildFilterConditions('priority', ['high', 'unassigned', 'low'], 'simple');
      expect(result).toEqual([
        { priority: { $in: [null, undefined, ''] } },
        { priority: { $exists: false } },
        { priority: { $in: ['high', 'low'] } },
      ]);
    });

    test('should handle single assigned value', () => {
      const result = buildFilterConditions('area', ['engineering'], 'simple');
      expect(result).toEqual([{ area: { $in: ['engineering'] } }]);
    });

    test('should handle leadId field', () => {
      const result = buildFilterConditions('leadId', ['user123', 'user456'], 'simple');
      expect(result).toEqual([{ leadId: { $in: ['user123', 'user456'] } }]);
    });
  });

  describe('array field type', () => {
    test('should build conditions for assigned values only', () => {
      const result = buildFilterConditions('quarters', ['2024Q1', '2024Q2'], 'array');
      expect(result).toEqual([{ quarters: { $in: ['2024Q1', '2024Q2'] } }]);
    });

    test('should build conditions for unassigned only', () => {
      const result = buildFilterConditions('teamIds', ['unassigned'], 'array');
      expect(result).toEqual([
        { teamIds: { $in: [null, undefined] } },
        { teamIds: { $exists: false } },
        { teamIds: { $size: 0 } },
      ]);
    });

    test('should build conditions for both assigned and unassigned', () => {
      const result = buildFilterConditions('quarters', ['2024Q1', 'unassigned'], 'array');
      expect(result).toEqual([
        { quarters: { $in: [null, undefined] } },
        { quarters: { $exists: false } },
        { quarters: { $size: 0 } },
        { quarters: { $in: ['2024Q1'] } },
      ]);
    });
  });

  describe('nested field type', () => {
    test('should build conditions for assigned values only', () => {
      const result = buildFilterConditions('dependencies.team', ['team1', 'team2'], 'nested');
      expect(result).toEqual([{ 'dependencies.team': { $in: ['team1', 'team2'] } }]);
    });

    test('should build conditions for unassigned only', () => {
      const result = buildFilterConditions('dependencies.team', ['unassigned'], 'nested');
      expect(result).toEqual([
        { dependencies: { $in: [null, undefined] } },
        { dependencies: { $exists: false } },
        { dependencies: { $size: 0 } },
      ]);
    });

    test('should build conditions for both assigned and unassigned', () => {
      const result = buildFilterConditions('dependencies.team', ['team1', 'unassigned'], 'nested');
      expect(result).toEqual([
        { dependencies: { $in: [null, undefined] } },
        { dependencies: { $exists: false } },
        { dependencies: { $size: 0 } },
        { 'dependencies.team': { $in: ['team1'] } },
      ]);
    });

    test('should handle empty baseField gracefully', () => {
      const result = buildFilterConditions('.team', ['unassigned'], 'nested');
      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('should handle only unassigned values for all types', () => {
      const simpleResult = buildFilterConditions('priority', ['unassigned'], 'simple');
      const arrayResult = buildFilterConditions('quarters', ['unassigned'], 'array');
      const nestedResult = buildFilterConditions('dependencies.team', ['unassigned'], 'nested');

      expect(simpleResult).toHaveLength(2);
      expect(arrayResult).toHaveLength(3);
      expect(nestedResult).toHaveLength(3);
    });

    test('should filter out unassigned from assigned values', () => {
      const result = buildFilterConditions('priority', ['high', 'unassigned', 'low', 'unassigned'], 'simple');
      expect(result).toEqual([
        { priority: { $in: [null, undefined, ''] } },
        { priority: { $exists: false } },
        { priority: { $in: ['high', 'low'] } },
      ]);
    });

    test('should handle duplicate assigned values', () => {
      const result = buildFilterConditions('area', ['engineering', 'engineering', 'design'], 'simple');
      expect(result).toEqual([{ area: { $in: ['engineering', 'engineering', 'design'] } }]);
    });
  });
});

describe('mergeFilterConditions', () => {
  describe('empty query scenarios', () => {
    test('should not modify query when conditions are empty', () => {
      const query = { type: 'project' };
      mergeFilterConditions(query, []);
      expect(query).toEqual({ type: 'project' });
    });

    test('should add $or to empty query', () => {
      const query: Record<string, unknown> = {};
      const conditions = [{ priority: { $in: ['high'] } }];
      mergeFilterConditions(query, conditions);
      expect(query).toEqual({
        $or: [{ priority: { $in: ['high'] } }],
      });
    });
  });

  describe('query with existing $or', () => {
    test('should convert to $and when $or already exists', () => {
      const query: Record<string, unknown> = {
        $or: [{ type: 'project' }],
      };
      const conditions = [{ priority: { $in: ['high'] } }];
      mergeFilterConditions(query, conditions);

      expect(query).toEqual({
        $and: [{ $or: [{ type: 'project' }] }, { $or: [{ priority: { $in: ['high'] } }] }],
      });
      expect(query.$or).toBeUndefined();
    });
  });

  describe('query with existing $and', () => {
    test('should append to existing $and array', () => {
      const query: Record<string, unknown> = {
        $and: [{ type: 'project' }, { archived: { $ne: true } }],
      };
      const conditions = [{ priority: { $in: ['high'] } }];
      mergeFilterConditions(query, conditions);

      expect(query).toEqual({
        $and: [{ type: 'project' }, { archived: { $ne: true } }, { $or: [{ priority: { $in: ['high'] } }] }],
      });
    });
  });

  describe('complex merging scenarios', () => {
    test('should handle multiple merges correctly', () => {
      const query: Record<string, unknown> = {};

      // First merge
      const priorityConditions = [{ priority: { $in: ['high'] } }];
      mergeFilterConditions(query, priorityConditions);

      // Second merge
      const areaConditions = [{ area: { $in: ['engineering'] } }];
      mergeFilterConditions(query, areaConditions);

      expect(query).toEqual({
        $and: [{ $or: [{ priority: { $in: ['high'] } }] }, { $or: [{ area: { $in: ['engineering'] } }] }],
      });
    });

    test('should handle merge with complex conditions', () => {
      const query: Record<string, unknown> = {};
      const conditions = [
        { priority: { $in: [null, undefined, ''] } },
        { priority: { $exists: false } },
        { priority: { $in: ['high', 'low'] } },
      ];
      mergeFilterConditions(query, conditions);

      expect(query).toEqual({
        $or: conditions,
      });
    });
  });

  describe('edge cases', () => {
    test('should handle non-array $and gracefully', () => {
      const query: Record<string, unknown> = {
        $and: 'invalid' as unknown,
      };
      const conditions = [{ priority: { $in: ['high'] } }];
      mergeFilterConditions(query, conditions);

      expect(query).toEqual({
        $and: 'invalid',
        $or: [{ priority: { $in: ['high'] } }],
      });
    });

    test('should handle query with both existing $or and other fields', () => {
      const query: Record<string, unknown> = {
        type: 'project',
        archived: { $ne: true },
        $or: [{ status: 'active' }],
      };
      const conditions = [{ priority: { $in: ['high'] } }];
      mergeFilterConditions(query, conditions);

      expect(query).toEqual({
        type: 'project',
        archived: { $ne: true },
        $and: [{ $or: [{ status: 'active' }] }, { $or: [{ priority: { $in: ['high'] } }] }],
      });
      expect(query.$or).toBeUndefined();
    });
  });
});

describe('integration scenarios', () => {
  test('should work together for realistic project filtering', () => {
    const query: Record<string, unknown> = {
      archived: { $ne: true },
      type: 'project',
    };

    // Add priority filter
    const priorityConditions = buildFilterConditions('priority', ['high', 'unassigned'], 'simple');
    mergeFilterConditions(query, priorityConditions);

    // Add quarter filter
    const quarterConditions = buildFilterConditions('quarters', ['2024Q1', 'unassigned'], 'array');
    mergeFilterConditions(query, quarterConditions);

    // Add dependency filter
    const depConditions = buildFilterConditions('dependencies.team', ['team1'], 'nested');
    mergeFilterConditions(query, depConditions);

    expect(query).toEqual({
      archived: { $ne: true },
      type: 'project',
      $and: [
        {
          $or: [
            { priority: { $in: [null, undefined, ''] } },
            { priority: { $exists: false } },
            { priority: { $in: ['high'] } },
          ],
        },
        {
          $or: [
            { quarters: { $in: [null, undefined] } },
            { quarters: { $exists: false } },
            { quarters: { $size: 0 } },
            { quarters: { $in: ['2024Q1'] } },
          ],
        },
        {
          $or: [{ 'dependencies.team': { $in: ['team1'] } }],
        },
      ],
    });
  });
});
