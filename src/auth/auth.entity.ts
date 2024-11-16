import {
  IsString,
  IsEmail,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsDefined,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsIn(['editor', 'viewer'], { each: true })
  roles: string[];
}

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;
}

export class AuthResponseDto {
  @IsString()
  accessToken: string;
}
