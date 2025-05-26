'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineEstimatesEditorProps {
  estimates?: Array<{
    department: string;
    value: number;
  }>;
  onSave: (estimates: Array<{ department: string; value: number }>) => void;
  className?: string;
  disabled?: boolean;
}

// Calculate total weeks from estimates array
const getTotalWeeks = (estimates?: Array<{ department: string; value: number }>): number => {
  if (!estimates || estimates.length === 0) return 0;
  return estimates.reduce((total, estimate) => total + estimate.value, 0);
};

// Format weeks display
const formatWeeks = (weeks: number): string => {
  if (weeks === 0) return '--';
  if (weeks === 1) return '1 week';
  return `${weeks} weeks`;
};

export function InlineEstimatesEditor({
  estimates = [],
  onSave,
  className,
  disabled = false,
}: InlineEstimatesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const totalWeeks = getTotalWeeks(estimates);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(totalWeeks.toString());
  };

  const handleSave = () => {
    const numericValue = parseFloat(editValue) || 0;

    // For simplicity, we'll distribute the total evenly across existing departments
    // or create a single "general" estimate if none exist
    let newEstimates: Array<{ department: string; value: number }>;

    if (estimates.length > 0) {
      // Distribute evenly across existing departments
      const valuePerDept = numericValue / estimates.length;
      newEstimates = estimates.map((est) => ({
        department: est.department,
        value: valuePerDept,
      }));
    } else {
      // Create a single general estimate
      newEstimates = numericValue > 0 ? [{ department: 'general', value: numericValue }] : [];
    }

    onSave(newEstimates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-6 text-xs border border-input focus:border-ring focus:ring-1 focus:ring-ring/50',
          className,
        )}
        placeholder="0"
        min="0"
        step="0.5"
        autoFocus
      />
    );
  }

  return (
    <div
      className={cn(
        'cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 text-xs transition-colors',
        disabled && 'cursor-default hover:bg-transparent',
        className,
      )}
      onClick={handleStartEdit}
    >
      {formatWeeks(totalWeeks)}
    </div>
  );
}
