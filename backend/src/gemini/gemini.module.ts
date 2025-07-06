import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { AudioProcessor } from './gemini.processor';
import { BooksModule } from '../books/books.module';
import { Chapter } from '../books/entities/chapter.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Chapter]),
    BullModule.registerQueue({
      name: 'audio-processing',
    }),
    BooksModule,
  ],
  providers: [
    GeminiService,
    AudioProcessor, // Provide the processor
  ],
  // Don't need to export BullModule from here anymore if BooksModule handles injection
  exports: [GeminiService],
})
export class GeminiModule {}
