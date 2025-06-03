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
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const utils = trpc.useUtils();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 5000;

  useEffect(() => {
    if (!enabled) {
      // Clean up any existing connections
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const connectStream = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
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
        reconnectAttempts.current = 0; // Reset reconnection attempts on successful connection
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

        // Only attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          console.log(
            `Attempting to reconnect assignment stream... (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectStream();
            }
          }, RECONNECT_INTERVAL);
        } else {
          console.error('Max reconnection attempts reached. Stopping reconnection attempts.');
        }
      };
    };

    // Initial connection
    connectStream();

    // Cleanup on unmount or dependency change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
      reconnectAttempts.current = 0;
    };
  }, [plannerId, enabled, utils.assignment.getAssignments]);

  return {
    isConnected,
    lastEvent,
    reconnectAttempts: reconnectAttempts.current,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
      reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS; // Prevent further reconnection attempts
    },
  };
}
