import { Exclude } from 'class-transformer';
import { EntityHelper } from 'src/utils/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Audio extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bitrate: number;

  @Column()
  codec: string;

  @Column()
  duration: number;

  @Column()
  format: string;

  @Column()
  frequency: number;

  @Column()
  channels: number;

  @Column()
  @Exclude({ toPlainOnly: true })
  size: number;

  @Column()
  @Exclude({ toPlainOnly: true })
  s3Key: string;
}
