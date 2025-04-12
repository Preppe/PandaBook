import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GeminiService } from './gemini.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../books/entities/chapter.entity'; // Adjusted import path
import { BooksService } from '../books/books.service'; // Import BooksService
// Book entity import might not be needed directly anymore

@Processor('audio-processing') // Name of the queue
export class AudioProcessor {
  private readonly logger = new Logger(AudioProcessor.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly booksService: BooksService, // Inject BooksService
    // Inject Chapter repository for saving later (Task 5.2)
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>, // Keep Chapter repo for saving
  ) {}

  // Define the process method for a specific job type
  @Process('generate-chapters') // Name of the job type within the queue
  async handleGenerateChapters(job: Job<{ bookId: string }>) {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`);
    const { bookId } = job.data;

    try {
      // Fetch book using BooksService
      // findOne in BooksService already includes the 'audio' relation
      const book = await this.booksService.findOne(bookId);

      if (!book) {
        throw new Error(`Book with ID ${bookId} not found.`);
      }
      // Ensure audio and s3Key exist
      if (!book.audio || !book.audio.s3Key) {
        // Log a warning and skip processing if audio/s3Key is missing
        this.logger.warn(`Audio data or s3Key missing for book ID ${bookId}. Skipping chapter generation.`);
        return; // Exit processing for this job gracefully
      }

      const audioPath = book.audio.s3Key; // Use s3Key as the path/identifier

      // Call Gemini service (Task 5.1)
      this.logger.log(`Calling Gemini service for book ${bookId}, audio path: ${audioPath}`);
      const generatedChapters = await this.geminiService.analyzeAudio(audioPath);

      // Log generated chapters (Task 5.2 - Placeholder for saving)
      this.logger.log(`Received chapters for book ${bookId}: ${JSON.stringify(generatedChapters)}`);

      // --- Placeholder for Task 5.2: Saving chapters ---
      // This part will be implemented later. For now, we just log.
      // Example:
      // const chaptersToSave = generatedChapters.map(chap =>
      //   this.chaptersRepository.create({ ...chap, book })
      // );
      // await this.chaptersRepository.save(chaptersToSave);
      // this.logger.log(`Successfully saved ${chaptersToSave.length} chapters for book ${bookId}`);
      // --- End Placeholder ---

      this.logger.log(`Finished processing job ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack);
      // Rethrow the error to let Bull handle retries/failures based on queue settings
      throw error;
    }
  }
}
