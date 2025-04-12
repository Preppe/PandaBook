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

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Audio, Bookmark, Chapter]), // Add Chapter entity
    S3Module,
    BullModule.registerQueue({ // Register queue here if BooksService needs it directly
      name: 'audio-processing',
    }),
  ],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService, TypeOrmModule] // Export TypeOrmModule to provide repositories
})
export class BooksModule {}
