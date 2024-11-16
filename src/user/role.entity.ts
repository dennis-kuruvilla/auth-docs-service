import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsIn(['admin', 'editor', 'viewer'], { each: true })
  roles: string[];
}

export class DeleteRoleDto {
  @IsString()
  @IsIn(['admin', 'editor', 'viewer'], { each: true })
  role: string;
}
