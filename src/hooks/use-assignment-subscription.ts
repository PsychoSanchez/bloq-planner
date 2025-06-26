'use client';

import { useCallback, useState } from 'react';
import { trpc } from '@/utils/trpc';

interface UseAssignmentSubscriptionOptions {
  plannerId: string;
  assigneeId?: string;
  projectId?: string;
  enabled?: boolean;
}

interface LastAction {
  type: 'updated';
  timestamp: number;
}

export function useAssignmentSubscription(options: UseAssignmentSubscriptionOptions) {
  const { plannerId, assigneeId, projectId, enabled = true } = options;

  const [lastAction, setLastAction] = useState<LastAction | undefined>();
  const [isConnected, setIsConnected] = useState(enabled);

  const utils = trpc.useUtils();

  const handleAssignmentChange = useCallback(
    (response: {
      id: string;
      data: {
        id: string;
        timestamp?: number;
        data?: unknown;
      };
    }) => {
      // Extract the actual event from the tRPC wrapper
      const event = response.data;

      // Update last action
      setLastAction({
        type: 'updated',
        timestamp: event.timestamp ?? 0,
      });

      // Invalidate relevant queries to refresh data
      utils.assignment.getAssignments.invalidate();
    },
    [utils.assignment.getAssignments],
  );

  // Subscribe to assignment changes
  trpc.assignment.onAssignmentChange.useSubscription(
    {
      plannerId,
      assigneeId,
      projectId,
    },
    {
      enabled: enabled && isConnected,
      onData: handleAssignmentChange,
      onError: (error) => {
        console.error('Assignment subscription error:', error);
        setIsConnected(false);
      },
    },
  );

  const toggleConnection = useCallback(() => {
    setIsConnected((prev) => !prev);
  }, []);

  return {
    lastAction,
    isConnected: enabled && isConnected,
    toggleConnection,
  };
}
