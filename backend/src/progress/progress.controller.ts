import { Controller, Get, Param, UseGuards, ParseUUIDPipe, Logger } from '@nestjs/common';
// Removed unused imports: NotFoundException, InjectRepository, Repository, AudiobookProgress, RedisService
import { ApiTags, ApiBearerAuth, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service'; // Import ProgressService

// Removed ProgressData interface as logic is moved to service

@ApiTags('Progress')
@ApiBearerAuth()
@Controller({
  path: 'progress',
  version: '1',
})
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name); // Keep logger if needed

  constructor(
    // Removed direct repository and redisService injection
    private readonly progressService: ProgressService, // Inject ProgressService
  ) {}

  @Get(':userId/:bookId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get audiobook progress for a user' })
  @ApiParam({ name: 'userId', type: String, description: 'User UUID' })
  @ApiParam({ name: 'bookId', type: String, description: 'Book UUID' })
  @ApiResponse({ status: 200, description: 'Returns the progress time in seconds.', type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProgress(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ): Promise<{ time: number }> {
    return this.progressService.findOne(userId, bookId);
  }
}
