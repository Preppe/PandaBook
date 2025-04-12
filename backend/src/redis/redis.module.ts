import { Module } from '@nestjs/common';
// Removed duplicate import
import { RedisService } from './redis.service'; // Corrected path

@Module({
  providers: [RedisService],
  exports: [RedisService], // Export RedisService
})
export class RedisModule {}
