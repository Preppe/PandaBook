import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // Assuming UUID or similar string ID

  @IsString()
  @IsNotEmpty()
  bookId: string; // Assuming UUID or similar string ID

  @IsInt()
  @Min(0)
  time: number; // Progress time in seconds
}
