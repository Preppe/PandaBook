import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { CreateBookDto } from './dto/create-book.dto';

interface UploadSession {
  metadata: CreateBookDto;
  totalChunks: number;
  uploadedChunks: number;
  createdAt: string;
  chunkKeys: string[];
  originalFilename?: string;
}

/**
 * Tipo per serializzazione sessione (cover.buffer: string | Buffer)
 */
type CreateBookDtoForSession = Omit<CreateBookDto, 'cover'> & {
  cover?: Omit<NonNullable<CreateBookDto['cover']>, 'buffer'> & { buffer: string | Buffer };
};

@Injectable()
export class UploadSessionService {
  private readonly logger = new Logger(UploadSessionService.name);
  private readonly SESSION_TTL = 60 * 60 * 2; // 2 hours in seconds
  private readonly CHUNK_TTL = 60 * 60 * 4; // 4 hours in seconds

  constructor(private readonly redisService: RedisService) {}

  private getSessionKey(uploadId: string): string {
    return `upload:session:${uploadId}`;
  }

  private getChunkKey(uploadId: string, chunkIndex: number): string {
    return `upload:chunk:${uploadId}:${chunkIndex}`;
  }

  async createSession(uploadId: string, totalChunks: number, metadata: any, originalFilename?: string): Promise<void> {
    const sessionKey = this.getSessionKey(uploadId);

    const session: UploadSession = {
      metadata,
      totalChunks,
      uploadedChunks: 0,
      createdAt: new Date().toISOString(),
      chunkKeys: [],
      originalFilename,
    };

    const client = this.redisService.getClient();
    await client.setex(sessionKey, this.SESSION_TTL, JSON.stringify(session));
  }

  async getSession(uploadId: string): Promise<UploadSession | null> {
    const sessionKey = this.getSessionKey(uploadId);
    const client = this.redisService.getClient();

    const sessionData = await client.get(sessionKey);
    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData) as UploadSession;
  }

  async storeChunk(uploadId: string, chunkIndex: number, chunk: Buffer): Promise<void> {
    const chunkKey = this.getChunkKey(uploadId, chunkIndex);
    const client = this.redisService.getClient();

    // Store chunk with TTL
    await client.setex(chunkKey, this.CHUNK_TTL, chunk);

    // Update session with chunk key and increment count
    const sessionKey = this.getSessionKey(uploadId);
    const sessionData = await client.get(sessionKey);

    if (!sessionData) {
      throw new BadRequestException('Upload session not found');
    }

    const session: UploadSession = JSON.parse(sessionData);

    // Check if chunk already exists to avoid double counting
    if (!session.chunkKeys.includes(chunkKey)) {
      session.chunkKeys.push(chunkKey);
      session.uploadedChunks++;
    }

    // Update session with new chunk info
    await client.setex(sessionKey, this.SESSION_TTL, JSON.stringify(session));
  }

  async getAllChunks(uploadId: string): Promise<Buffer[]> {
    const session = await this.getSession(uploadId);
    if (!session) {
      throw new BadRequestException('Upload session not found');
    }

    const client = this.redisService.getClient();
    const chunks: Buffer[] = [];

    // Get chunks in the correct order
    for (let i = 0; i < session.totalChunks; i++) {
      const chunkKey = this.getChunkKey(uploadId, i);
      const chunkData = await client.getBuffer(chunkKey);

      if (!chunkData) {
        throw new BadRequestException(`Chunk ${i} not found for upload ${uploadId}`);
      }

      chunks.push(chunkData);
    }

    return chunks;
  }

  async updateSessionMetadata(uploadId: string, metadata: any): Promise<void> {
    const sessionKey = this.getSessionKey(uploadId);
    const client = this.redisService.getClient();

    const sessionData = await client.get(sessionKey);
    if (!sessionData) {
      throw new BadRequestException('Upload session not found');
    }

    const session: UploadSession = JSON.parse(sessionData);
    session.metadata = { ...session.metadata, ...metadata };

    await client.setex(sessionKey, this.SESSION_TTL, JSON.stringify(session));
  }

  async isUploadComplete(uploadId: string): Promise<boolean> {
    const session = await this.getSession(uploadId);
    if (!session) {
      return false;
    }

    return session.uploadedChunks === session.totalChunks;
  }

  async cleanupSession(uploadId: string): Promise<void> {
    const session = await this.getSession(uploadId);
    if (!session) {
      return;
    }

    const client = this.redisService.getClient();

    // Delete all chunks
    const chunkKeys = session.chunkKeys;
    if (chunkKeys.length > 0) {
      await client.del(chunkKeys);
    }

    // Delete session
    const sessionKey = this.getSessionKey(uploadId);
    await client.del(sessionKey);
  }

  // Gestione completa dell'upload chunk (spostata da BooksService)
  async handleChunkUpload(
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    chunk: Buffer,
    metadata?: CreateBookDto,
    originalFilename?: string,
  ): Promise<{ success: boolean; message: string }> {
    // Check if session exists, if not create it
    const existingSession = await this.getSession(uploadId);

    let metadataForSession: CreateBookDtoForSession | undefined = metadata;
    if (metadata && metadata.cover && metadata.cover.buffer) {
      metadataForSession = {
        ...metadata,
        cover: {
          ...metadata.cover,
          buffer: metadata.cover.buffer.toString('base64'),
        },
      };
    }

    if (!existingSession) {
      // For the first chunk, metadata should be provided (validated in controller)
      if (chunkIndex === 0) {
        if (!metadataForSession) {
          throw new BadRequestException('Metadata is required for the first chunk');
        }
        await this.createSession(uploadId, totalChunks, metadataForSession, originalFilename);
      } else {
        throw new BadRequestException('Upload session not found. Cannot upload chunk without existing session.');
      }
    } else if (metadataForSession && chunkIndex === 0) {
      // Update metadata if provided with first chunk
      await this.updateSessionMetadata(uploadId, metadataForSession);
    }

    // Store the chunk
    await this.storeChunk(uploadId, chunkIndex, chunk);

    // Extend session TTL on activity
    await this.extendSessionTTL(uploadId);

    return {
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`,
    };
  }

  async extendSessionTTL(uploadId: string): Promise<void> {
    const sessionKey = this.getSessionKey(uploadId);
    const client = this.redisService.getClient();

    const exists = await client.exists(sessionKey);
    if (exists) {
      await client.expire(sessionKey, this.SESSION_TTL);
    }
  }

  async getUploadProgress(uploadId: string): Promise<{
    uploadedChunks: number;
    totalChunks: number;
    progress: number;
  } | null> {
    const session = await this.getSession(uploadId);
    if (!session) {
      return null;
    }

    const progress = session.totalChunks > 0 ? (session.uploadedChunks / session.totalChunks) * 100 : 0;

    return {
      uploadedChunks: session.uploadedChunks,
      totalChunks: session.totalChunks,
      progress: Math.round(progress * 100) / 100,
    };
  }

  async cleanupExpiredSessions(): Promise<void> {
    const client = this.redisService.getClient();
    const pattern = 'upload:session:*';

    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      for (const key of keys) {
        const ttl = await client.ttl(key);
        if (ttl === -1) {
          // Key exists but has no TTL, set it
          await client.expire(key, this.SESSION_TTL);
        } else if (ttl === -2) {
          // Key doesn't exist, nothing to do
          continue;
        }

        // Check if session is very old (in case TTL wasn't set properly)
        const sessionData = await client.get(key);
        if (sessionData) {
          const session: UploadSession = JSON.parse(sessionData);
          const createdAt = new Date(session.createdAt);
          const now = new Date();
          const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceCreation > 6) {
            // 6 hours old
            const uploadId = key.replace('upload:session:', '');
            await this.cleanupSession(uploadId);
          }
        }
      }
    } while (cursor !== '0');
  }

  async getAllActiveSessions(): Promise<string[]> {
    const client = this.redisService.getClient();
    const pattern = 'upload:session:*';
    const sessionIds: string[] = [];

    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      for (const key of keys) {
        const uploadId = key.replace('upload:session:', '');
        sessionIds.push(uploadId);
      }
    } while (cursor !== '0');

    return sessionIds;
  }
}
