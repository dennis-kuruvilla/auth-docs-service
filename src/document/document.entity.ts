import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @Index()
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    name: 'status',
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ type: 'varchar', length: 50, default: '1.0.0' })
  version: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'last_updated_by_id' })
  lastUpdatedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @VersionColumn()
  revision: number;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  version?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  version?: string;
}
