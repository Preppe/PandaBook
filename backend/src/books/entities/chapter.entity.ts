import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Book } from './book.entity'; // Adjusted import path
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity()
export class Chapter extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 1 })
  @Allow()
  @Column({ type: 'int' })
  chapterNumber: number;

  @ApiProperty({ example: 'Introduction to the story' })
  @Allow()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 0 })
  @Allow()
  @Column({ type: 'int' }) // Store time in seconds
  startTime: number;

  @ApiProperty({ example: 300 })
  @Allow()
  @Column({ type: 'int' }) // Store time in seconds
  endTime: number;

  @ManyToOne(() => Book, (book) => book.chapters, {
    eager: false, // Avoid loading book by default
    onDelete: 'CASCADE', // Delete chapters if book is deleted
  })
  book: Book;
}
