// Shared MongoDB query builder utilities

// Helper function to build filter conditions with unassigned support
export function buildFilterConditions(
  fieldName: string,
  values: string[],
  fieldType: 'simple' | 'array' | 'nested' = 'simple',
): Record<string, unknown>[] {
  if (values.length === 0) return [];

  const hasUnassigned = values.includes('unassigned');
  const assignedValues = values.filter((v) => v !== 'unassigned');

  const conditions: Record<string, unknown>[] = [];

  if (hasUnassigned) {
    // Handle unassigned based on field type
    switch (fieldType) {
      case 'array':
        conditions.push(
          { [fieldName]: { $in: [null, undefined] } },
          { [fieldName]: { $exists: false } },
          { [fieldName]: { $size: 0 } },
        );
        break;
      case 'nested': {
        const baseField = fieldName.split('.')[0];
        if (baseField) {
          conditions.push(
            { [baseField]: { $in: [null, undefined] } },
            { [baseField]: { $exists: false } },
            { [baseField]: { $size: 0 } },
          );
        }
        break;
      }
      default: // simple
        conditions.push({ [fieldName]: { $in: [null, undefined, ''] } }, { [fieldName]: { $exists: false } });
    }
  }

  if (assignedValues.length > 0) {
    conditions.push({ [fieldName]: { $in: assignedValues } });
  }

  return conditions;
}

// Helper function to merge filter conditions into the main query
export function mergeFilterConditions(query: Record<string, unknown>, conditions: Record<string, unknown>[]): void {
  if (conditions.length === 0) return;

  if (query.$or) {
    // Combine with existing $or conditions using $and
    query.$and = [{ $or: query.$or }, { $or: conditions }];
    delete query.$or;
  } else if (query.$and && Array.isArray(query.$and)) {
    // Add to existing $and
    query.$and.push({ $or: conditions });
  } else {
    // First filter condition
    query.$or = conditions;
  }
}
