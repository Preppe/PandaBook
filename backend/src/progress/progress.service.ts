import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // Import Cron decorators
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { AudiobookProgress } from './entities/audiobook-progress.entity';

interface ProgressData {
  time: number;
  updatedAt: number; // Timestamp from Redis (milliseconds)
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);
  private isSyncing = false; // Add sync flag

  constructor(
    @InjectRepository(AudiobookProgress)
    private readonly progressRepository: Repository<AudiobookProgress>,
    private readonly redisService: RedisService,
  ) {}

  async findOne(userId: string, bookId: string): Promise<{ time: number }> {
    const redisKey = `progress:${userId}`;
    let progressTime = 0; // Default to 0

    try {
      // 1. Check Redis first
      const redisData = await this.redisService.getClient().hget(redisKey, bookId);
      if (redisData) {
        this.logger.debug(`Found progress in Redis for User: ${userId}, Book: ${bookId}`);
        try {
          const parsedData: ProgressData = JSON.parse(redisData);
          if (typeof parsedData.time === 'number') {
            progressTime = parsedData.time;
            this.logger.log(`Returning progress from Redis: ${progressTime}s`);
            return { time: progressTime }; // Return immediately if found in Redis
          } else {
             this.logger.warn(`Invalid time format in Redis data for User: ${userId}, Book: ${bookId}`);
          }
        } catch (parseError) {
          this.logger.error(`Failed to parse Redis data for User: ${userId}, Book: ${bookId}`, parseError);
          // Proceed to check DB if Redis data is corrupt
        }
      } else {
         this.logger.debug(`No progress found in Redis for User: ${userId}, Book: ${bookId}. Checking DB.`);
      }

      // 2. If not in Redis or Redis data was invalid, check the database
      const dbProgress = await this.progressRepository.findOne({
        where: { userId, bookId },
      });

      if (dbProgress) {
        progressTime = dbProgress.time;
        this.logger.log(`Returning progress from DB: ${progressTime}s`);
      } else {
        // No progress found in DB either
        this.logger.log(`No progress found in DB for User: ${userId}, Book: ${bookId}. Returning 0.`);
        progressTime = 0;
      }

    } catch (error) {
       this.logger.error(`Error fetching progress for User: ${userId}, Book: ${bookId}`, error);
       // Default to 0 on error, or rethrow if needed
       progressTime = 0;
    }

    return { time: progressTime };
  }

  // --- Merged Sync Logic ---
  @Cron(CronExpression.EVERY_10_MINUTES) // Or your desired frequency
  async handleCronSync() { // Renamed method to avoid conflict if needed
    if (this.isSyncing) {
      this.logger.warn('Sync job already running. Skipping this run.');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting Redis to DB sync job...');

    const keysToSync: string[] = []; // Keys successfully processed and ready for deletion
    const progressUpdates: AudiobookProgress[] = [];
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000; // 30 minutes in milliseconds
    let processedKeysCount = 0;
    let relevantUpdatesCount = 0;

    try {
      this.logger.log(`Filtering progress updated since ${new Date(thirtyMinutesAgo).toISOString()}`);
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redisService.scan(cursor, 'progress:*', 100); // Scan in batches
        cursor = nextCursor;

        for (const key of keys) {
          processedKeysCount++;
          const userId = key.split(':')[1];
          if (!userId) {
            this.logger.warn(`Skipping invalid Redis key format: ${key}`);
            continue;
          }

          let bookProgressMap: Record<string, string>;
          try {
            bookProgressMap = await this.redisService.hgetall(key);
          } catch (redisGetError) {
            this.logger.error(`Failed to HGETALL for key ${key}`, redisGetError);
            continue; // Skip this key if Redis read fails
          }

          let keyHasRelevantUpdate = false;
          for (const bookId in bookProgressMap) {
            let progressData: ProgressData;
            try {
              progressData = JSON.parse(bookProgressMap[bookId]);
              if (typeof progressData.time !== 'number' || typeof progressData.updatedAt !== 'number') {
                 throw new Error('Invalid progress data structure');
              }
            } catch (parseError) {
              this.logger.error(`Failed to parse JSON for key ${key}, field ${bookId}: ${bookProgressMap[bookId]}`, parseError);
              continue; // Skip this field
            }

            // Only process if updated within the last 30 minutes
            if (progressData.updatedAt >= thirtyMinutesAgo) {
               relevantUpdatesCount++;
               keyHasRelevantUpdate = true; // Mark the key for potential deletion later
               this.logger.debug(`Found relevant update for User: ${userId}, Book: ${bookId}, Time: ${progressData.time}, Updated: ${new Date(progressData.updatedAt).toISOString()}`);
               const progressEntity = this.progressRepository.create({
                  userId,
                  bookId,
                  time: progressData.time,
                  // Let TypeORM handle createdAt/updatedAt on save
               });
               progressUpdates.push(progressEntity);
            }
          }
          // If any update for this user was relevant, add the key to be deleted later
          if (keyHasRelevantUpdate) {
             keysToSync.push(key);
          }
        }
      } while (cursor !== '0');

      this.logger.log(`Scan complete. Processed ${processedKeysCount} Redis keys. Found ${relevantUpdatesCount} relevant updates.`);

      if (progressUpdates.length > 0) {
        this.logger.log(`Attempting to save ${progressUpdates.length} updates to the database...`);
        try {
          // Use save with chunking for potentially large updates
          await this.progressRepository.save(progressUpdates, { chunk: 100 });
          this.logger.log(`Successfully saved ${progressUpdates.length} updates to the database.`);

          // Delete ONLY the keys that had relevant updates AND were successfully saved
          if (keysToSync.length > 0) {
             this.logger.log(`Attempting to delete ${keysToSync.length} keys from Redis...`);
             try {
                 const deletedCount = await this.redisService.del(keysToSync);
                 this.logger.log(`Successfully deleted ${deletedCount} keys from Redis.`);
             } catch (redisDelError) {
                 this.logger.error(`Failed to delete keys from Redis after DB sync`, redisDelError);
             }
          }

        } catch (dbError) {
           this.logger.error(`Error saving progress updates to the database. Redis keys were NOT deleted.`, dbError);
        }
      } else {
        this.logger.log('No recent progress updates found in Redis to sync.');
      }

    } catch (scanError) {
      this.logger.error('Error during Redis to DB sync job:', scanError);
    } finally {
      this.isSyncing = false;
      this.logger.log('Redis to DB sync job finished.');
    }
  }
  // --- End Merged Sync Logic ---
}
