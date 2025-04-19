import { Controller, Get, Param, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common'; // Removed Logger, Added Request
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
  // private readonly logger = new Logger(ProgressController.name); // Removed unused logger

  constructor(
    // Removed direct repository and redisService injection
    private readonly progressService: ProgressService, // Inject ProgressService
  ) {}

  @Get(':bookId') // Removed userId from path
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: "Get authenticated user's audiobook progress" }) // Updated summary
  // @ApiParam({ name: 'userId', type: String, description: 'User UUID' }) // Removed userId ApiParam
  @ApiParam({ name: 'bookId', type: String, description: 'Book UUID' })
  @ApiResponse({ status: 200, description: 'Returns the progress time in seconds.', type: Number }) // Assuming service returns number or null/0
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProgress(
    @Request() req, // Get user from request
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ): Promise<{ time: number }> { // Return type matches service
    const userId = req.user?.id; // Extract userId from JWT payload
    if (!userId) {
      // This should technically not happen if AuthGuard is working, but good practice
      throw new Error('User ID not found in authenticated request.');
    }
    return this.progressService.findOne(userId, bookId);
  }
}
