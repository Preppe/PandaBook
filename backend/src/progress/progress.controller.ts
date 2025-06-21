import { Controller, Get, Param, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate'; // Import Paginate decorator and types
import { AudiobookProgress } from './entities/audiobook-progress.entity'; // Import entity for return type

@ApiTags('Progress')
@ApiBearerAuth()
@Controller({
  path: 'progress',
  version: '1',
})
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
  ) {}

  @Get(':bookId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: "Get authenticated user's audiobook progress for a specific book" }) // Updated summary for clarity
  @ApiParam({ name: 'bookId', type: String, description: 'Book UUID' })
  @ApiResponse({ status: 200, description: 'Returns the progress time in seconds.', type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProgress(
    @Request() req,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ): Promise<{ time: number }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in authenticated request.');
    }
    return this.progressService.findOne(userId, bookId);
  }

  @Get() // New endpoint for paginated progress
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: "Get authenticated user's paginated audiobook progress" })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of audiobook progress.', type: Paginated<AudiobookProgress> }) // Use Paginated type
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPaginatedProgress(
    @Request() req,
    @Paginate() query: PaginateQuery, // Inject pagination query
  ): Promise<Paginated<AudiobookProgress>> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in authenticated request.');
    }
    return this.progressService.findAllPaginated(userId, query); // Call the new service method
  }
}
