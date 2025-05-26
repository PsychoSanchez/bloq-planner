'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlinePercentageEditorProps {
  value?: number;
  onSave: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Format number as percentage
const formatPercentage = (value: number): string => {
  if (value === 0) return '0%';
  return `${value.toFixed(1)}%`;
};

export function InlinePercentageEditor({
  value = 0,
  onSave,
  placeholder = '0%',
  className,
  disabled = false,
}: InlinePercentageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [displayValue, setDisplayValue] = useState(formatPercentage(value));

  useEffect(() => {
    setDisplayValue(formatPercentage(value));
  }, [value]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleSave = () => {
    const numericValue = parseFloat(editValue) || 0;
    onSave(numericValue);
    setDisplayValue(formatPercentage(numericValue));
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
      <div className="relative">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pr-5 h-6 text-xs border border-input focus:border-ring focus:ring-1 focus:ring-ring/50',
            className,
          )}
          placeholder="0"
          step="0.1"
          autoFocus
        />
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">%</span>
      </div>
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
      {value !== 0 ? displayValue : placeholder}
    </div>
  );
}
