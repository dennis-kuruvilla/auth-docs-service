import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/user/role.entity';
import { User } from 'src/user/user.entity';
import { In, Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './auth.entity';
import { JwtService } from '@nestjs/jwt';
import { Session } from './session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log('inside register');
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) throw new HttpException('User already exists', 400);

    const user = new User();
    user.email = email;
    user.password = password;

    user.roles = await this.roleRepository.findBy({ name: 'viewer' });

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      roles: user.roles.map((role) => role.name),
    };
    const token = this.jwtService.sign(payload);

    const session = new Session();
    session.userId = user.id;
    session.token = token;
    session.status = 'active';
    await this.sessionRepository.save(session);

    return { accessToken: token };
  }

  async logout(userId: string, token: string) {
    const session = await this.sessionRepository.findOne({
      where: { userId, token, status: 'active' },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.sessionRepository.remove(session);

    return { message: 'Logged out successfully' };
  }

  async validateSession(userId: string, token: string) {
    const session = await this.sessionRepository.findOne({
      where: { userId, token, status: 'active' },
    });

    return !!session;
  }
}
