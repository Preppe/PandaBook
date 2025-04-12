import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBookDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    author: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    cover?: Express.Multer.File;

    @IsOptional()
    audio?: Express.Multer.File;
}