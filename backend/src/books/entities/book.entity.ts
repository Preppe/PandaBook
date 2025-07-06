import { EntityHelper } from 'src/utils/entity-helper';
import { AfterLoad, Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'; // Added OneToMany, AfterLoad
import { Audio } from './audio.entity';
import { Chapter } from './chapter.entity'; // Adjusted import path

@Entity()
export class Book extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  narrator: string;

  @Column({ nullable: true })
  cover: string;

  @OneToOne(() => Audio, (audio) => audio.id, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn()
  audio?: Audio | null;

  @Column({ nullable: true })
  audioId?: string;

  @OneToMany(() => Chapter, (chapter) => chapter.book, {
    cascade: true, // Optional: cascade operations like save
    eager: false, // Optional: don't load chapters by default
  })
  chapters: Chapter[];

  @AfterLoad()
  afterLoad() {
    if (this.cover && !this.cover.startsWith('http')) {
      // Access process.env directly as ConfigService injection is not feasible in entity hooks
      const cdnBaseUrl = process.env.CDN_BASE_URL;
      if (cdnBaseUrl) {
        this.cover = `${cdnBaseUrl}/covers/${this.cover}`;
      }
    }
  }
}
