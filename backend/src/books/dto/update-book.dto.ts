import { IsOptional, IsString, IsArray, ValidateNested, IsInt } from "class-validator";
import { Type } from "class-transformer";

class UpdateChapterDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsInt()
  chapterNumber: number;

  @IsString()
  description: string;

  @IsInt()
  startTime: number;

  @IsInt()
  endTime: number;
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  cover?: Express.Multer.File;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChapterDto)
  chapters?: UpdateChapterDto[];
}
