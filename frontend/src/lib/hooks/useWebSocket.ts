import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ClientToServerEvents {
  updateProgress: (data: { userId: string; bookId: string; time: number }) => void;
}

type AppSocket = Socket<any, ClientToServerEvents>;

export const useWebSocket = (url: string | undefined) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    if (!url) {
      return;
    }

    if (typeof window !== 'undefined' && !socketRef.current) {
        const socketInstance: AppSocket = io(url, {
            transports: ['websocket'],
        });

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
        });
    }

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [url]);

  const emitEvent = useCallback(
    <E extends keyof ClientToServerEvents>(event: E, ...args: Parameters<ClientToServerEvents[E]>) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, ...args);
      } else {
      }
    },
    []
  );

  return { socket: socketRef.current, isConnected, emitEvent };
};