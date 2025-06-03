import { NextRequest } from 'next/server';
import { assignmentEventEmitter } from '@/server/trpc';
import { AssignmentEvent } from '@/server/routers/assignment';

export async function GET(request: NextRequest) {
  // Parse query params for filtering
  const { searchParams } = new URL(request.url);
  const plannerId = searchParams.get('plannerId');

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      const onUpdate = (event: AssignmentEvent) => {
        // Filter by plannerId if provided
        if (plannerId && event.plannerId !== plannerId) {
          return;
        }

        try {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // Listen for assignment updates
      assignmentEventEmitter.on('assignmentUpdate', onUpdate);

      // Handle client disconnect
      const cleanup = () => {
        assignmentEventEmitter.off('assignmentUpdate', onUpdate);
      };

      // Use a weak reference to detect when the response is closed
      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(`: keepalive\n\n`);
        } catch {
          // Connection closed
          cleanup();
          clearInterval(checkClosed);
        }
      }, 30000); // Keep alive every 30 seconds

      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
