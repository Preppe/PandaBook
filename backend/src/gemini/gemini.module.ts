import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { AudioProcessor } from './gemini.processor';
// TypeOrmModule forFeature removed, will be imported via BooksModule
import { BooksModule } from '../books/books.module'; // Import BooksModule

@Module({
  imports: [
    ConfigModule, // Import ConfigModule to use ConfigService
    BullModule.registerQueue({ // Keep queue registration for the processor
      name: 'audio-processing',
    }),
    BooksModule, // Import BooksModule to get access to Book/Chapter repositories
  ],
  providers: [
    GeminiService,
    AudioProcessor, // Provide the processor
  ],
  // Don't need to export BullModule from here anymore if BooksModule handles injection
  exports: [GeminiService],
})
export class GeminiModule {}
