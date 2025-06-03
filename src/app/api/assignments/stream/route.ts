import { NextRequest } from 'next/server';
import { assignmentEventEmitter } from '@/server/trpc';
import { AssignmentEvent } from '@/server/routers/assignment';

// Define cleanup function type for better type safety
interface StreamController extends ReadableStreamDefaultController {
  _cleanup?: () => void;
}

export async function GET(request: NextRequest) {
  // Parse query params for filtering
  const { searchParams } = new URL(request.url);
  const plannerId = searchParams.get('plannerId');

  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      const onUpdate = (event: AssignmentEvent) => {
        // Filter by plannerId if provided
        if (plannerId && event.plannerId !== plannerId) {
          return;
        }

        try {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        } catch {
          // If we can't enqueue, the stream is likely closed
          controller.close();
        }
      };

      // Listen for assignment updates
      assignmentEventEmitter.on('assignmentUpdate', onUpdate);

      // Keep alive interval
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(`: keepalive\n\n`);
        } catch {
          // Connection closed, cleanup will be handled in cancel()
          console.log('Keep-alive failed, connection likely closed');
        }
      }, 30000); // Keep alive every 30 seconds

      // Store cleanup references for the cancel method
      (controller as StreamController)._cleanup = () => {
        assignmentEventEmitter.off('assignmentUpdate', onUpdate);
        clearInterval(keepAliveInterval);
      };
    },

    cancel() {
      // Handle cleanup when the stream is cancelled/closed
      const streamController = this as StreamController;
      if (streamController._cleanup) {
        streamController._cleanup();
      }
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
