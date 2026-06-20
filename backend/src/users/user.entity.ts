import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  STORE_OWNER = 'store_owner',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 60 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 400 })
  address: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}