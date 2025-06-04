'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiIcon, WifiOffIcon, ActivityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveStatusBadgeProps {
  isConnected: boolean;
  lastAction?: {
    type: 'created' | 'updated' | 'deleted' | 'bulkCreated' | 'bulkUpdated' | 'bulkDeleted';
    timestamp: number;
  };
  onToggleConnection: () => void;
  className?: string;
}

const ACTION_LABELS = {
  created: 'Assignment created',
  updated: 'Assignment updated',
  deleted: 'Assignment deleted',
  bulkCreated: 'Bulk assignments created',
  bulkUpdated: 'Bulk assignments updated',
  bulkDeleted: 'Bulk assignments deleted',
} as const;

const ACTION_COLORS = {
  created: 'text-green-600 dark:text-green-400',
  updated: 'text-blue-600 dark:text-blue-400',
  deleted: 'text-red-600 dark:text-red-400',
  bulkCreated: 'text-green-600 dark:text-green-400',
  bulkUpdated: 'text-blue-600 dark:text-blue-400',
  bulkDeleted: 'text-red-600 dark:text-red-400',
} as const;

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 1000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function LiveStatusBadge({ isConnected, lastAction, onToggleConnection, className }: LiveStatusBadgeProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago every 10 seconds
  useEffect(() => {
    if (!lastAction) return;

    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(lastAction.timestamp));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [lastAction]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Connection Status Badge */}
      <Badge
        variant={isConnected ? 'default' : 'secondary'}
        className={cn(
          'flex items-center gap-1 px-2 py-1 text-xs transition-all',
          isConnected
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
        )}
      >
        {isConnected ? (
          <>
            <ActivityIcon className="h-3 w-3 animate-pulse" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOffIcon className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </Badge>

      {/* Last Action Display */}
      {lastAction && isConnected && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className={cn('font-medium', ACTION_COLORS[lastAction.type])}>{ACTION_LABELS[lastAction.type]}</span>
          <span>·</span>
          <span>{timeAgo}</span>
        </div>
      )}

      {/* Connection Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleConnection}
        className="h-6 px-2 text-xs"
        title={isConnected ? 'Disconnect from real-time updates' : 'Connect to real-time updates'}
      >
        {isConnected ? (
          <>
            <WifiOffIcon className="h-3 w-3 mr-1" />
            Disconnect
          </>
        ) : (
          <>
            <WifiIcon className="h-3 w-3 mr-1" />
            Connect
          </>
        )}
      </Button>
    </div>
  );
}
