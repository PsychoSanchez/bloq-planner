'use client';

import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/utils/trpc';
import type { AssignmentEvent } from '@/server/routers/assignment';

interface UseAssignmentStreamOptions {
  plannerId?: string;
  enabled?: boolean;
}

export function useAssignmentStream(options: UseAssignmentStreamOptions = {}) {
  const { plannerId, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<AssignmentEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Build URL with optional plannerId filter
    const url = new URL('/api/assignments/stream', window.location.origin);
    if (plannerId) {
      url.searchParams.set('plannerId', plannerId);
    }

    // Create EventSource connection
    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Assignment stream connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: AssignmentEvent = JSON.parse(event.data);
        setLastEvent(data);

        // Handle different event types
        switch (data.type) {
          case 'connected':
            // Initial connection established
            break;

          case 'CREATE':
          case 'UPDATE':
          case 'BULK_CREATE':
          case 'BULK_UPDATE':
          case 'BULK_UPSERT':
            // Invalidate assignments query to refetch data
            utils.assignment.getAssignments.invalidate();
            break;

          case 'DELETE':
          case 'BULK_DELETE':
            // Invalidate assignments query to refetch data
            utils.assignment.getAssignments.invalidate();
            break;

          default:
            console.log('Unknown assignment event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing assignment stream event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Assignment stream error:', error);
      setIsConnected(false);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect assignment stream...');
          // The useEffect will run again due to dependency changes
        }
      }, 5000);
    };

    // Cleanup on unmount or dependency change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [plannerId, enabled, utils.assignment.getAssignments]);

  return {
    isConnected,
    lastEvent,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    },
  };
}
