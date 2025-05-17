'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MoonIcon, SunIcon, LaptopIcon } from 'lucide-react';

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <RadioGroup value={theme} onValueChange={setTheme} className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <RadioGroupItem value="light" id="light" className="peer sr-only" />
        <Label
          htmlFor="light"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <SunIcon className="mb-2 h-6 w-6" />
          Light
        </Label>
      </div>
      <div>
        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
        <Label
          htmlFor="dark"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <MoonIcon className="mb-2 h-6 w-6" />
          Dark
        </Label>
      </div>
      <div>
        <RadioGroupItem value="system" id="system" className="peer sr-only" />
        <Label
          htmlFor="system"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <LaptopIcon className="mb-2 h-6 w-6" />
          System
        </Label>
      </div>
    </RadioGroup>
  );
}
