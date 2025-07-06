import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  SerializeOptions,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { BooksService } from './books.service';
import { BookmarkDto } from './dto/bookmark.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Audio } from './entities/audio.entity';
import { Book } from './entities/book.entity';

@ApiTags('Books')
@Controller({
  path: 'books',
  version: '1',
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ===== GET =====

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all books', description: 'Retrieves a list of books with pagination and filtering options' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of books retrieved successfully.' })
  @SerializeOptions({ groups: ['user'] })
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Book>> {
    return this.booksService.findManyWithPagination(query);
  }

  @Get('audio/:id')
  @ApiOperation({ summary: 'Audio metadata', description: 'Retrieves the metadata of the audio file for a book' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audio metadata retrieved successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book or audio file not found.' })
  @SerializeOptions({ groups: ['user'] })
  async getAudioMetadata(@Param('id') id: string): Promise<Audio> {
    return this.booksService.getAudioMetadata(id);
  }

  @Get(':id/stream')
  @ApiOperation({ summary: 'Stream audio file', description: 'Streams the audio file for a book with support for range requests' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audio file streamed successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book or audio file not found.' })
  @ApiResponse({ status: HttpStatus.PARTIAL_CONTENT, description: 'Partial content (for range requests).' })
  @SerializeOptions({ groups: ['user'] })
  async streamAudio(@Param('id') id: string, @Res() res: Response): Promise<void> {
    return this.booksService.streamAudio(id, res);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a book by ID', description: 'Retrieves a book by its ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book retrieved successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found.' })
  @SerializeOptions({ groups: ['user'] })
  async findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

  // ===== POST =====

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new book', description: 'Creates a new book with optional audio file' })
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The book has been successfully created.', type: Book })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @SerializeOptions({ groups: ['admin'] })
  create(@Body() createBookDto: CreateBookDto, @UploadedFiles() files: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }): Promise<Book> {
    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];
    return this.booksService.create({ ...createBookDto, audio: audioFile, cover: coverFile });
  }

  // Bookmark endpoints
  @Post('bookmarks')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add bookmark', description: "Adds a book to the user's bookmarks" })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Book has been bookmarked successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated.' })
  @ApiBearerAuth()
  @SerializeOptions({ groups: ['user'] })
  async addBookmark(@Body() bookmarkDto: BookmarkDto, @Req() req: Request): Promise<void> {
    const user = req.user as JwtPayloadType;
    await this.booksService.addBookmark(user.id, bookmarkDto.bookId);
  }

  // Chunked upload endpoints
  @Post('chunk')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'chunk', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file chunk', description: 'Uploads a single chunk of a large file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chunk uploaded successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid chunk data.' })
  @SerializeOptions({ groups: ['admin'] })
  async uploadChunk(
    @Body()
    body: {
      uploadId: string;
      chunkIndex: string;
      totalChunks: string;
      chunk: { buffer: Buffer };
      title?: string;
      author?: string;
      description?: string;
      originalFilename?: string;
    },
    @UploadedFiles() files: { chunk?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<{ success: boolean; message: string }> {
    const { uploadId, chunkIndex: chunkIndexStr, totalChunks: totalChunksStr, title, author, description, originalFilename } = body;

    // Convert string values to numbers
    const chunkIndex = parseInt(chunkIndexStr as string, 10);
    const totalChunks = parseInt(totalChunksStr as string, 10);

    if (!files?.chunk?.[0]) {
      throw new BadRequestException('Chunk file is required');
    }

    const chunk = files.chunk[0];

    // Validate that first chunk has required metadata
    if (chunkIndex === 0 && (!title || !author)) {
      throw new BadRequestException('Title and author are required for the first chunk');
    }

    // Construct metadata from individual fields for first chunk
    const enrichedMetadata =
      chunkIndex === 0
        ? {
            title: title || '',
            author: author || '',
            description,
            cover: files?.cover?.[0],
          }
        : undefined;

    return this.booksService.uploadChunk(uploadId, chunkIndex, totalChunks, chunk.buffer, enrichedMetadata, originalFilename);
  }

  @Post('finalize')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Finalize chunked upload', description: 'Finalizes a chunked upload and creates the book' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Book created successfully from chunks.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Upload session not found or incomplete.' })
  @SerializeOptions({ groups: ['admin'] })
  async finalizeUpload(@Body() body: { uploadId: string }): Promise<Book> {
    return this.booksService.finalizeUpload(body.uploadId);
  }

  // ===== PATCH =====

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a book and its chapters', description: 'Updates a book and its chapters' })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'The book has been successfully updated.', type: Book })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @SerializeOptions({ groups: ['admin'] })
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto, @UploadedFiles() files: { cover?: Express.Multer.File[] }): Promise<Book> {
    const coverFile = files?.cover?.[0];
    return this.booksService.update(id, { ...updateBookDto, cover: coverFile });
  }

  // ===== DELETE =====

  @Delete('bookmarks/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove bookmark', description: "Removes a book from the user's bookmarks" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Book has been removed from bookmarks successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bookmark not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User is not allowed to remove this bookmark.' })
  @ApiBearerAuth()
  async removeBookmark(@Param('id') bookId: string, @Req() req: Request): Promise<void> {
    const user = req.user as JwtPayloadType;
    await this.booksService.removeBookmark(user.id, bookId);
  }

  @Delete('cleanup')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cleanup failed upload', description: 'Cleans up a failed or cancelled upload session' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Upload session cleaned up successfully.' })
  async cleanupUpload(@Body() body: { uploadId: string }): Promise<void> {
    await this.booksService.cleanupUpload(body.uploadId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book', description: 'Deletes a book by its ID along with associated files and data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book deleted successfully.', type: Book })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found.' })
  @SerializeOptions({ groups: ['admin'] })
  async remove(@Param('id') id: string): Promise<Book> {
    return this.booksService.remove(id);
  }
}
