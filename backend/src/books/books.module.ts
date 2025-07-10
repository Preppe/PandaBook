import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { S3Module } from 'src/s3/s3.module';
import { Audio } from './entities/audio.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Chapter } from './entities/chapter.entity'; // Adjusted import path
import { BullModule } from '@nestjs/bull'; // Import BullModule for queue injection in BooksService
import { RedisModule } from 'src/redis/redis.module';
import { UploadSessionService } from './upload-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Audio, Bookmark, Chapter]), // Add Chapter entity
    S3Module,
    RedisModule,
  ],
  providers: [BooksService, UploadSessionService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}
