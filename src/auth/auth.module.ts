import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from 'src/user/user.entity';
import { Role } from 'src/user/role.entity';
import { getEnvOrThrow } from 'src/common/utils/env';
import { Session } from './session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Session]),
    PassportModule,
    JwtModule.register({
      secret: getEnvOrThrow('JWT_SECRET'),
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
