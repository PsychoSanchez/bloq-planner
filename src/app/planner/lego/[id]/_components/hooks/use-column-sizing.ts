import { useState, useEffect } from 'react';
import { COLUMN_SIZES, ColumnSizeType } from '@/lib/utils/column-sizing';

export const useColumnSizing = () => {
  const [selectedSize, setSelectedSize] = useState<ColumnSizeType>('normal');

  // Determine column size based on screen width
  useEffect(() => {
    const updateColumnSize = () => {
      const width = window.innerWidth;

      const getSize = () => {
        if (width < 1600) {
          return 'compact';
        } else if (width < 1920) {
          return 'normal';
        } else {
          return 'wide';
        }
      };

      const newSize = getSize();
      if (selectedSize !== newSize) {
        setSelectedSize(newSize);
      }
    };

    // Set initial size
    updateColumnSize();

    // Add resize listener
    window.addEventListener('resize', updateColumnSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateColumnSize);
  }, [selectedSize]);

  // Get current column width value
  const columnWidth = COLUMN_SIZES[selectedSize];

  return { selectedSize, columnWidth };
};
