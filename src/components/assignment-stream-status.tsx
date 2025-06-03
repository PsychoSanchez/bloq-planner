'use client';

import { useAssignmentStream } from '@/hooks/use-assignment-stream';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, ActivitySquare, WifiOff } from 'lucide-react';

interface AssignmentStreamStatusProps {
  plannerId?: string;
  className?: string;
}

export function AssignmentStreamStatus({ plannerId, className }: AssignmentStreamStatusProps) {
  const { isConnected, lastEvent, disconnect } = useAssignmentStream({ plannerId });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={isConnected ? 'default' : 'destructive'} className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Activity className="h-3 w-3" />
            Live
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Disconnected
          </>
        )}
      </Badge>

      {lastEvent && lastEvent.type !== 'connected' && (
        <Badge variant="outline" className="flex items-center gap-1">
          <ActivitySquare className="h-3 w-3" />
          {lastEvent.type.toLowerCase().replace('_', ' ')}
        </Badge>
      )}

      {isConnected && (
        <Button variant="ghost" size="sm" onClick={disconnect} className="h-6 px-2 text-xs">
          Disconnect
        </Button>
      )}
    </div>
  );
}
