import * as React from 'react';

import { cn } from '@/lib/utils';

function CompactCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('bg-card text-card-foreground flex flex-col gap-2 rounded-sm border p-2 shadow-sm', className)}
      {...props}
    />
  );
}

function CompactCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  );
}

function CompactCardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('text-sm font-semibold leading-tight', className)} {...props} />;
}

function CompactCardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-xs', className)} {...props} />;
}

function CompactCardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CompactCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={className} {...props} />;
}

function CompactCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center pt-1 text-xs', className)} {...props} />;
}

export {
  CompactCard,
  CompactCardHeader,
  CompactCardFooter,
  CompactCardTitle,
  CompactCardAction,
  CompactCardDescription,
  CompactCardContent,
};
