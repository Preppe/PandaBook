import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Res,
  Headers,
  Query,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Audio } from './entities/audio.entity';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { BookmarkDto } from './dto/bookmark.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Books')
@Controller({
  path: 'books',
  version: '1',
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

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

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all books', description: 'Retrieves a list of books with pagination and filtering options' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of books retrieved successfully.' })
  @SerializeOptions({ groups: ['user'] })
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Book>> {
    return this.booksService.findManyWithPagination(query);
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

  @Get(':id/stream')
  @ApiOperation({ summary: 'Stream audio file', description: 'Streams the audio file for a book with support for range requests' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audio file streamed successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book or audio file not found.' })
  @ApiResponse({ status: HttpStatus.PARTIAL_CONTENT, description: 'Partial content (for range requests).' })
  @SerializeOptions({ groups: ['user'] })
  async streamAudio(@Param('id') id: string, @Res() res: Response): Promise<void> {
    return this.booksService.streamAudio(id, res);
  }

  @Get('audio/:id')
  @ApiOperation({ summary: 'Audio metadata', description: 'Retrieves the metadata of the audio file for a book' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audio metadata retrieved successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book or audio file not found.' })
  @SerializeOptions({ groups: ['user'] })
  async getAudioMetadata(@Param('id') id: string): Promise<Audio> {
    return this.booksService.getAudioMetadata(id);
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
}
