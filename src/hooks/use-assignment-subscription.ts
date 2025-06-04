'use client';

import { useCallback, useState } from 'react';
import { trpc } from '@/utils/trpc';

interface UseAssignmentSubscriptionOptions {
  plannerId?: string;
  assigneeId?: string;
  projectId?: string;
  enabled?: boolean;
  onAssignmentChange?: (event: {
    type: 'created' | 'updated' | 'deleted' | 'bulkCreated' | 'bulkUpdated' | 'bulkDeleted';
    data?: unknown;
    timestamp: number;
    id: string;
  }) => void;
}

interface LastAction {
  type: 'created' | 'updated' | 'deleted' | 'bulkCreated' | 'bulkUpdated' | 'bulkDeleted';
  timestamp: number;
}

export function useAssignmentSubscription(options: UseAssignmentSubscriptionOptions = {}) {
  const { plannerId, assigneeId, projectId, enabled = true, onAssignmentChange } = options;

  const [lastAction, setLastAction] = useState<LastAction | undefined>();
  const [isConnected, setIsConnected] = useState(enabled);

  const utils = trpc.useUtils();

  const handleAssignmentChange = useCallback(
    (response: {
      id: string;
      data: {
        id: string;
        type: 'created' | 'updated' | 'deleted' | 'bulkCreated' | 'bulkUpdated' | 'bulkDeleted';
        timestamp: number;
        data?: unknown;
      };
    }) => {
      // Extract the actual event from the tRPC wrapper
      const event = response.data;

      // Update last action
      setLastAction({
        type: event.type,
        timestamp: event.timestamp,
      });

      // Invalidate relevant queries to refresh data
      utils.assignment.getAssignments.invalidate();

      // Call the custom handler if provided
      if (onAssignmentChange) {
        onAssignmentChange(event);
      }
    },
    [utils.assignment.getAssignments, onAssignmentChange],
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
