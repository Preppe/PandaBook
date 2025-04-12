// Keep only one set of imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressGateway } from './progress/progress.gateway';
import { RedisModule } from 'src/redis/redis.module';
// Removed SyncService import
import { AudiobookProgress } from './entities/audiobook-progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([AudiobookProgress]),
  ],
  providers: [ProgressGateway, ProgressService], // Removed SyncService
  controllers: [ProgressController],
})
export class ProgressModule {}
// Removed duplicate @Module decorator and class definition
