import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of the events the client will emit
interface ClientToServerEvents {
  updateProgress: (data: { userId: string; bookId: string; time: number }) => void;
  // Add other client-to-server events here if needed
}

// Use a specific type for the socket instance
type AppSocket = Socket<any, ClientToServerEvents>; // Using 'any' for ServerToClientEvents for now

export const useWebSocket = (url: string | undefined) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    if (!url) {
      // console.error('WebSocket URL is not defined.'); // Keep error handling minimal in hook
      return;
    }

    // Initialize the socket connection
    // Ensure this runs only once on the client-side
    if (typeof window !== 'undefined' && !socketRef.current) {
        // console.log(`Attempting to connect WebSocket to: ${url}`); // Removed log
        const socketInstance: AppSocket = io(url, {
            transports: ['websocket'], // Explicitly use WebSocket transport
            // Add any other connection options here
            // e.g., withCredentials: true, if needed for auth cookies
        });

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
            // console.log('WebSocket connected:', socketInstance.id); // Removed log
            setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            // console.log('WebSocket disconnected:', reason); // Removed log
            setIsConnected(false);
            // Optional: Implement reconnection logic if needed
        });

        socketInstance.on('connect_error', (error) => {
            // console.error('WebSocket connection error:', error); // Removed log
            // Optional: Handle connection errors
        });

        // Add listeners for server-to-client events here if needed
        // socketInstance.on('someServerEvent', (data) => { ... });
    }


    // Cleanup function to disconnect socket on component unmount
    return () => {
      if (socketRef.current?.connected) {
        // console.log('Disconnecting WebSocket...'); // Removed log
        socketRef.current.disconnect();
        socketRef.current = null; // Clear the ref
        setIsConnected(false);
      }
    };
  }, [url]); // Re-run effect if URL changes

  // Function to emit events to the server
  const emitEvent = useCallback(
    // Use spread syntax for arguments to match socket.io's emit signature
    <E extends keyof ClientToServerEvents>(event: E, ...args: Parameters<ClientToServerEvents[E]>) => {
      if (socketRef.current?.connected) {
        // Pass arguments using spread syntax
        socketRef.current.emit(event, ...args);
      } else {
        // console.warn(`WebSocket not connected. Cannot emit event: ${event}`); // Removed log
      }
    },
    [] // No dependencies, relies on the current socketRef
  );

  return { socket: socketRef.current, isConnected, emitEvent };
};