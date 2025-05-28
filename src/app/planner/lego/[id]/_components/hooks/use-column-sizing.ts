import { useState, useEffect } from 'react';
import { COLUMN_SIZES, ColumnSizeType } from '@/lib/utils/column-sizing';

export const useColumnSizing = () => {
  const [selectedSize, setSelectedSize] = useState<ColumnSizeType>('normal');

  // Load selected size from localStorage on initial render
  useEffect(() => {
    const savedSize = localStorage.getItem('lego-planner-column-size');
    if (savedSize) {
      try {
        const size = JSON.parse(savedSize) as ColumnSizeType;
        if (size === 'compact' || size === 'normal' || size === 'wide') {
          setSelectedSize(size);
        }
      } catch (e) {
        console.error('Failed to parse saved column size', e);
      }
    }
  }, []);

  // Save selected size to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('lego-planner-column-size', JSON.stringify(selectedSize));
  }, [selectedSize]);

  // Set column size
  const setColumnSize = (size: ColumnSizeType) => {
    setSelectedSize(size);
  };

  // Reset column widths to default
  const resetColumnSize = () => {
    setSelectedSize('normal');
    localStorage.removeItem('lego-planner-column-size');
  };

  // Get current column width value
  const columnWidth = COLUMN_SIZES[selectedSize];

  return { selectedSize, setColumnSize, resetColumnSize, columnWidth };
};
