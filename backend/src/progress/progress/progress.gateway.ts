import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common'; // Import validation pipes

// Configure CORS - adjust origin as needed for your frontend
@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for now, restrict in production
  },
})
export class ProgressGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    // Potentially handle user authentication/association here
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Handle cleanup if necessary
  }

  @UsePipes(new ValidationPipe()) // Apply validation using the DTO
  @SubscribeMessage('updateProgress')
  async handleUpdateProgress(
    @MessageBody() data: UpdateProgressDto,
    @ConnectedSocket() client: Socket, // Get the connected client if needed
  ): Promise<void> { // Return void or an acknowledgement
    const { userId, bookId, time } = data;
    const redisKey = `progress:${userId}`;
    const redisValue = JSON.stringify({ time, updatedAt: Date.now() });

    try {
      await this.redisService.hset(redisKey, bookId, redisValue);
      console.log(`Progress updated in Redis for user ${userId}, book ${bookId}: ${time}s`);
      // Optional: Send acknowledgement back to the client
      // client.emit('progressAcknowledged', { bookId, time });
    } catch (error) {
      console.error(`Failed to update progress in Redis for user ${userId}, book ${bookId}:`, error);
      // Optional: Send error back to the client
      // client.emit('progressUpdateFailed', { bookId, error: 'Failed to save progress' });
    }
  }

  // Handler for immediate saving requests (e.g., on page unload)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('saveFinalProgress')
  async handleSaveFinalProgress(
    @MessageBody() data: UpdateProgressDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`Received final progress save request for user ${data.userId}, book ${data.bookId}`);
    // For now, just update Redis immediately like a regular update.
    // Later, this could trigger an immediate DB save.
    await this.handleUpdateProgress(data, client);
    // Potentially add logic here later to bypass Redis and save directly to DB
  }
}
