import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    type: String,
    isArray: true,
    example: ['admin', 'editor'],
  })
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
