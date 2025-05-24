'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  PROJECT_COLORS,
  getProjectColorByName,
  getDefaultProjectColor,
  ProjectColor as ProjectColorType,
} from '@/lib/project-colors';

interface ColorSelectorProps {
  selectedColorName: string;
  onColorChange: (colorName: string) => void;
}

export function ColorSelector({ selectedColorName, onColorChange }: ColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectColor = (colorName: string) => {
    onColorChange(colorName);
    setIsOpen(false);
  };

  const currentProjectColorObj = getProjectColorByName(selectedColorName) || getDefaultProjectColor();
  const displayHexValue = currentProjectColorObj.hex;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-auto h-auto p-1 border-none hover:bg-muted/50 rounded-sm shadow-none text-xs bg-primary"
          title="Select project color"
        >
          <div
            className="w-4 h-4 rounded-sm border border-muted-foreground/50"
            style={{ backgroundColor: displayHexValue }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-4 gap-1">
          {PROJECT_COLORS.map((color: ProjectColorType) => (
            <button
              type="button"
              key={color.name}
              title={color.name}
              className={`w-5 h-5 rounded-sm flex items-center justify-center border-2 transition-all
                ${selectedColorName === color.name ? 'border-primary ring-1 ring-primary ring-offset-1 dark:ring-offset-background' : 'border-transparent hover:border-muted-foreground/30'}
              `}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleSelectColor(color.name)}
            >
              {selectedColorName === color.name && <Check className="w-3 h-3 text-white mix-blend-difference" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
