import { useState, useEffect, useCallback } from 'react';

export interface ColumnDefinition {
  id: string;
  label: string;
  defaultVisible: boolean;
}

export interface ColumnVisibility {
  [columnId: string]: boolean;
}

interface UseColumnVisibilityOptions {
  storageKey: string;
  columns: ColumnDefinition[];
}

export function useColumnVisibility({ storageKey, columns }: UseColumnVisibilityOptions) {
  // Initialize with default visibility
  const getDefaultVisibility = useCallback((): ColumnVisibility => {
    return columns.reduce((acc, column) => {
      acc[column.id] = column.defaultVisible;
      return acc;
    }, {} as ColumnVisibility);
  }, [columns]);

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(getDefaultVisibility);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedVisibility = JSON.parse(stored) as ColumnVisibility;
        // Merge with defaults to handle new columns
        const mergedVisibility = { ...getDefaultVisibility(), ...parsedVisibility };
        setColumnVisibility(mergedVisibility);
      }
    } catch (error) {
      console.warn('Failed to load column visibility from localStorage:', error);
    }
  }, [storageKey, getDefaultVisibility]);

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    } catch (error) {
      console.warn('Failed to save column visibility to localStorage:', error);
    }
  }, [storageKey, columnVisibility]);

  const toggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  const setColumnVisible = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setColumnVisibility(getDefaultVisibility());
  }, [getDefaultVisibility]);

  const isColumnVisible = useCallback(
    (columnId: string): boolean => {
      return columnVisibility[columnId] ?? true;
    },
    [columnVisibility],
  );

  const visibleColumns = columns.filter((column) => isColumnVisible(column.id));

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisible,
    resetToDefaults,
    isColumnVisible,
    visibleColumns,
  };
}
