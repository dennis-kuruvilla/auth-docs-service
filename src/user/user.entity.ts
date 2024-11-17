import defaultEncryptTransformer from '../common/transformers/encrypt.transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { IsString, IsEmail, MaxLength } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'bytea',
    transformer: defaultEncryptTransformer,
    nullable: true,
    select: false,
  })
  password: string | null;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  async validatePassword(password: string): Promise<boolean> {
    return password === this.password;
  }
}

export class UserDto {
  @IsString()
  id: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;
}
