import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Store } from '../stores/store.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  value: number; // 1-5 only, validated at DTO level

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'submitted_by' })
  submittedBy: User;

  @ManyToOne(() => Store, (s) => s.ratingsReceived)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}