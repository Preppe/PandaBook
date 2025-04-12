import { EntityHelper } from 'src/utils/entity-helper';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Book } from './book.entity';

@Entity()
export class Bookmark extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Book)
  @JoinColumn()
  book: Book;

  @Column()
  bookId: string;

  @CreateDateColumn()
  createdAt: Date;
}
