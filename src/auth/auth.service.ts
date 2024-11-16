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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log('inside register');
    const { email, password, roles } = registerDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) throw new HttpException('User already exists', 400);

    const user = new User();
    user.email = email;
    user.password = password;

    user.roles = await this.roleRepository.findBy({ name: In(roles) });

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
    return { accessToken: this.jwtService.sign(payload) };
  }
}
