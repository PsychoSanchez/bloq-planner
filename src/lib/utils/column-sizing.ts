// Predefined column width sizes
export const COLUMN_SIZES = {
  compact: 80,
  normal: 100,
  wide: 150,
} as const;

export type ColumnSizeType = keyof typeof COLUMN_SIZES;
