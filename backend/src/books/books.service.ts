import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Response } from 'express';
import { parseBuffer } from 'music-metadata';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { S3Service } from 'src/s3/s3.service';
import { paginateConfigBook } from 'src/utils/pagination-config';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Audio } from './entities/audio.entity';
import { Book } from './entities/book.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Chapter } from './entities/chapter.entity';
import { UploadSessionService } from './upload-session.service';

/**
 * Tipo per serializzazione sessione (cover.buffer: string | Buffer)
 */
type CreateBookDtoForSession = Omit<CreateBookDto, 'cover'> & {
  cover?: Omit<NonNullable<CreateBookDto['cover']>, 'buffer'> & { buffer: string | Buffer };
};

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name); // Add logger

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Audio)
    private readonly audioRepository: Repository<Audio>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectQueue('audio-processing') private audioQueue: Queue, // Inject the queue

    private readonly s3Service: S3Service,
    private readonly uploadSessionService: UploadSessionService,
  ) {}

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const { cover, chapters, ...bookData } = updateBookDto;

    return await this.bookRepository.manager.transaction(async (manager) => {
      // Recupera il libro con i capitoli
      const book = await manager.findOne(Book, {
        where: { id },
        relations: { chapters: true, audio: true },
      });
      if (!book) throw new NotFoundException('Book not found');

      // Aggiorna i dati base
      Object.assign(book, bookData);

      // Gestione cover
      if (cover) {
        const coverS3Key = `${Date.now()}-${cover.originalname}`;
        await this.s3Service.uploadFile({ ...cover, originalname: coverS3Key }, 'covers', 'public-read');
        book.cover = coverS3Key;
      }

      // Gestione capitoli
      if (Array.isArray(chapters)) {
        // Capitoli esistenti
        const existingChapters = book.chapters || [];
        const chaptersToKeep: Chapter[] = [];
        for (const chapterDto of chapters) {
          if (chapterDto.id) {
            // Update capitolo esistente
            const chapterId = chapterDto.id;
            const chapter = existingChapters.find((c) => c.id === chapterId);
            if (chapter) {
              Object.assign(chapter, { ...chapterDto, id: chapterId });
              await manager.save(Chapter, chapter);
              chaptersToKeep.push(chapter);
            }
          } else {
            // Nuovo capitolo
            const { id, ...chapterData } = chapterDto;
            const newChapter = manager.create(Chapter, {
              ...chapterData,
              book,
            });
            await manager.save(Chapter, newChapter);
            chaptersToKeep.push(newChapter);
          }
        }
        // Elimina capitoli rimossi
        for (const chapter of existingChapters) {
          if (!chapters.find((c) => c.id === chapter.id)) {
            await manager.delete(Chapter, chapter.id);
          }
        }
        book.chapters = chaptersToKeep;
      }

      await manager.save(book);
      return book;
    });
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { cover, audio, ...bookData } = createBookDto;

    // Declare audioEntity outside the if block
    let audioEntity: Audio | undefined = undefined;
    let coverKey: string | undefined = undefined;

    // Handle cover file upload if it exists
    if (cover) {
      const coverS3Key = `${Date.now()}-${cover.originalname}`;
      await this.s3Service.uploadFile(
        {
          ...cover,
          originalname: coverS3Key,
        },
        'covers',
        'public-read',
      );
      coverKey = coverS3Key;
    }

    // Check if audio file exists
    if (audio) {
      const metadataBuffer = Buffer.from(audio.buffer);

      // Extract metadata from audio file
      const metadata = await parseBuffer(metadataBuffer, { mimeType: audio.mimetype });

      // Create custom file object for S3 upload
      const s3Key = `books/audio/${Date.now()}-${audio.originalname}`;
      await this.s3Service.uploadFile(
        {
          ...audio,
          originalname: s3Key,
        },
        'audio',
        'public-read',
      );

      // Create audio entity with metadata
      audioEntity = await this.audioRepository.save({
        bitrate: metadata.format.bitrate || 0,
        codec: metadata.format.codec || '',
        duration: Math.round(metadata.format.duration || 0),
        format: metadata.format.container || '',
        frequency: metadata.format.sampleRate || 0,
        channels: metadata.format.numberOfChannels || 0,
        size: audio.size,
        s3Key: s3Key,
      });
    }

    // Create and save book with audio reference and cover
    const savedBook = await this.bookRepository.save({
      ...bookData,
      audio: audioEntity,
      cover: coverKey,
    });

    // If book saved successfully and has audio, dispatch job
    if (savedBook && savedBook.audio) {
      await this.audioQueue.add('generate-chapters', {
        bookId: savedBook.id,
      });
    }

    return savedBook;
  }

  async streamAudio(id: string, res: Response): Promise<void> {
    try {
      // Find the book with the given ID
      const book = await this.bookRepository.findOne({
        where: { id },
        relations: ['audio'],
      });

      if (!book || !book.audio) {
        throw new NotFoundException('Book or audio file not found');
      }

      const audio = book.audio;
      const s3Key = audio.s3Key;
      const fileSize = audio.size;
      const contentType = this.getContentTypeFromFormat(audio.format);
      // Use size and ID for ETag since we don't have timestamps
      const etag = `"${audio.id}-${audio.size}"`;

      // Handle If-None-Match cache validation
      const ifNoneMatch = res.req.headers['if-none-match'];
      // Skip Last-Modified header since we don't have timestamps
      if (ifNoneMatch === etag) {
        res.status(304).end();
        return;
      }

      // Set common headers
      const headers = {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        ETag: etag,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=604800', // 1 week cache
        'Content-Disposition': `inline; filename="${book.title}.${audio.format}"`,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      };

      // Handle range requests
      const range = res.req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        if (start >= fileSize || end >= fileSize) {
          res
            .status(416)
            .set({
              'Content-Range': `bytes */${fileSize}`,
            })
            .end();
          return;
        }

        headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
        headers['Content-Length'] = chunkSize.toString();

        res.status(206).set(headers);

        // Fetch only the requested range from S3
        const s3Response = await this.s3Service.getFile(s3Key, 'audio', range); // Pass range here

        // Stream the partial content
        if (s3Response.Body instanceof Readable) {
          s3Response.Body.pipe(res);
        } else {
          throw new BadRequestException('Unable to stream partial audio file');
        }
      } else {
        // No range requested, fetch the full file
        res.status(200).set(headers);
        const s3Response = await this.s3Service.getFile(s3Key, 'audio'); // No range

        // Stream the full content
        if (s3Response.Body instanceof Readable) {
          s3Response.Body.pipe(res);
        } else {
          throw new BadRequestException('Unable to stream full audio file');
        }
      }
      // Removed erroneous extra else block here
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Streaming error:', error);
      throw new BadRequestException('Error streaming audio file');
    }
  }

  private getContentTypeFromFormat(format: string): string {
    // Map common audio formats to MIME types
    const formatToMimeType: Record<string, string> = {
      mp3: 'audio/mpeg',
      mp4: 'audio/mp4',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
    };

    return formatToMimeType[format.toLowerCase()] || 'application/octet-stream';
  }

  async findManyWithPagination(query: PaginateQuery): Promise<Paginated<Book>> {
    return paginate<Book>(query, this.bookRepository, paginateConfigBook);
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['audio'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async getAudioMetadata(id: string): Promise<Audio> {
    const audio = await this.audioRepository.findOne({
      where: { id },
    });

    if (!audio) {
      throw new NotFoundException('Audio file not found');
    }

    return audio;
  }

  // Bookmark methods
  async addBookmark(userId: string, bookId: string): Promise<Bookmark> {
    // Check if book exists
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if bookmark already exists
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: {
        userId,
        bookId,
      },
    });

    if (existingBookmark) {
      return existingBookmark; // Bookmark already exists, return it
    }

    // Create new bookmark
    const bookmark = this.bookmarkRepository.create({
      userId,
      bookId,
    });

    return this.bookmarkRepository.save(bookmark);
  }

  async removeBookmark(userId: string, bookId: string): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    const bookmark = await this.bookmarkRepository.findOne({
      where: {
        userId,
        bookId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarkRepository.remove(bookmark);
  }

  // Chunked upload methods
  async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    chunk: Buffer,
    metadata?: CreateBookDto,
    originalFilename?: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.uploadSessionService.handleChunkUpload(uploadId, chunkIndex, totalChunks, chunk, metadata, originalFilename);
  }

  async finalizeUpload(uploadId: string): Promise<Book> {
    const session = await this.uploadSessionService.getSession(uploadId);

    if (!session) {
      throw new BadRequestException('Upload session not found');
    }

    // Check if upload is complete
    const isComplete = await this.uploadSessionService.isUploadComplete(uploadId);
    if (!isComplete) {
      throw new BadRequestException(`Incomplete upload: ${session.uploadedChunks}/${session.totalChunks} chunks received`);
    }

    try {
      // Get all chunks in the correct order
      const chunks = await this.uploadSessionService.getAllChunks(uploadId);
      const completeFile = Buffer.concat(chunks);

      // Create a mock file object similar to multer's file
      const filename = session.originalFilename || 'audio.mp3';

      const audioFile: Express.Multer.File = {
        buffer: completeFile,
        originalname: filename,
        mimetype: this.getMimeTypeFromExtension(filename),
        size: completeFile.length,
        fieldname: 'audio',
        encoding: '7bit',
        filename: filename,
        stream: null as any, // S3Service uses only buffer, stream not needed
        destination: '',
        path: '',
      };

      // Ricostruisci la cover se presente e serializzata in base64
      let coverFile: Express.Multer.File | undefined = undefined;
      if (session.metadata.cover && session.metadata.cover.buffer) {
        let coverBuffer = session.metadata.cover.buffer;
        if (typeof coverBuffer === 'string') {
          coverBuffer = Buffer.from(coverBuffer, 'base64');
        }
        coverFile = {
          ...session.metadata.cover,
          buffer: coverBuffer,
        } as Express.Multer.File;
      }

      // Create book using existing create method
      const createBookDto = {
        ...session.metadata,
        audio: audioFile,
        ...(coverFile ? { cover: coverFile } : {}),
      };

      const book = await this.create(createBookDto);

      // Cleanup session
      await this.uploadSessionService.cleanupSession(uploadId);

      return book;
    } catch (error) {
      throw new BadRequestException('Failed to finalize upload');
    }
  }

  async cleanupUpload(uploadId: string): Promise<void> {
    await this.uploadSessionService.cleanupSession(uploadId);
  }

  async getUploadProgress(uploadId: string): Promise<{
    uploadedChunks: number;
    totalChunks: number;
    progress: number;
  } | null> {
    return await this.uploadSessionService.getUploadProgress(uploadId);
  }

  private getMimeTypeFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      mp4: 'audio/mp4',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      aac: 'audio/aac',
    };
    return mimeTypes[extension || ''] || 'audio/mpeg';
  }

  async remove(id: string): Promise<Book> {
    // Find the book with all related entities
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['audio'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    try {
      // Delete associated S3 files
      const deletePromises: Promise<any>[] = [];

      // Delete audio file from S3 if exists
      if (book.audio?.s3Key) {
        const audioS3Key = book.audio.s3Key;
        deletePromises.push(this.s3Service.deleteFile(audioS3Key, 'audio').catch(() => {}));
      }

      // Delete cover file from S3 if exists
      if (book.cover) {
        deletePromises.push(this.s3Service.deleteFile(book.cover, 'covers').catch(() => {}));
      }

      // Wait for S3 deletions to complete (but don't fail if they error)
      await Promise.allSettled(deletePromises);

      // Delete bookmarks associated with this book
      await this.bookmarkRepository.delete({ bookId: id });

      // Delete audio entity if exists
      if (book.audio) {
        await this.audioRepository.remove(book.audio);
      }

      // Finally, delete the book itself
      await this.bookRepository.remove(book);

      return book;
    } catch (error) {
      throw new BadRequestException('Failed to delete book');
    }
  }
}
