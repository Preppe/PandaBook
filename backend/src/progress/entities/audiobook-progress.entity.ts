import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn, // Added CreateDateColumn for consistency
  Index,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper'; // Assuming EntityHelper provides common fields like id

// Using EntityHelper might add an 'id' column automatically.
// If we want userId and bookId as the composite primary key, we might need to adjust or not use EntityHelper.
// Let's define it explicitly as per the requirement.

@Entity('audiobook_progress')
@Index(['userId', 'bookId']) // Add composite index as requested
export class AudiobookProgress extends EntityHelper { // Extend EntityHelper if it provides common functionality like ID, otherwise remove extends
  @PrimaryColumn({ type: 'uuid' }) // Use PrimaryColumn for composite keys
  userId: string;

  @PrimaryColumn({ type: 'uuid' }) // Use PrimaryColumn for composite keys
  bookId: string;

  @Column({ type: 'int' })
  time: number; // Listening time in seconds

  // Use CreateDateColumn for the initial creation timestamp
  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Use UpdateDateColumn for the last update timestamp
  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
