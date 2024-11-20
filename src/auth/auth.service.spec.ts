import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../user/role.entity';
import { Session } from './session.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, HttpException } from '@nestjs/common';

jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let roleRepository: jest.Mocked<Repository<Role>>;
  let sessionRepository: jest.Mocked<Repository<Session>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockRepository = () => ({
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findBy: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    });

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UserRepository', useFactory: mockRepository },
        { provide: 'RoleRepository', useFactory: mockRepository },
        { provide: 'SessionRepository', useFactory: mockRepository },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get('UserRepository');
    roleRepository = module.get('RoleRepository');
    sessionRepository = module.get('SessionRepository');
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = { email: 'test@example.com', password: 'password' };
      const mockRole = { id: '1', name: 'viewer' };
      const mockUser = { id: '1', email: registerDto.email };

      userRepository.findOneBy.mockResolvedValue(null);
      roleRepository.findBy.mockResolvedValue([mockRole]);
      userRepository.save.mockResolvedValue(mockUser as User);

      const result = await authService.register(registerDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: registerDto.email,
      });
      expect(roleRepository.findBy).toHaveBeenCalledWith({ name: 'viewer' });
      expect(userRepository.save).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        roles: [mockRole],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if the user already exists', async () => {
      const registerDto = { email: 'test@example.com', password: 'password' };
      userRepository.findOneBy.mockResolvedValue({
        email: registerDto.email,
      } as User);

      await expect(authService.register(registerDto)).rejects.toThrow(
        new HttpException('User already exists', 400),
      );
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: 'hashedPassword',
        roles: [{ id: 1, name: 'viewer' }],
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      const mockToken = 'jwt-token';

      userRepository.findOne.mockResolvedValue(mockUser as any);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'roles', 'password'],
      });
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(sessionRepository.save).toHaveBeenCalledWith({
        userId: mockUser.id,
        token: mockToken,
        status: 'active',
      });
      expect(result).toEqual({ accessToken: mockToken });
    });

    it('should throw an UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpass' };

      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should remove a valid session', async () => {
      const userId = '1';
      const token = 'jwt-token';
      const mockSession = { id: 1, userId, token, status: 'active' };

      sessionRepository.findOne.mockResolvedValue(mockSession as any);

      await authService.logout(userId, token);

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { userId, token, status: 'active' },
      });
      expect(sessionRepository.remove).toHaveBeenCalledWith(mockSession);
    });

    it('should throw an UnauthorizedException for an invalid session', async () => {
      const userId = '1';
      const token = 'invalid-token';

      sessionRepository.findOne.mockResolvedValue(null);

      await expect(authService.logout(userId, token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateSession', () => {
    it('should return true for a valid session', async () => {
      const userId = '1';
      const token = 'jwt-token';
      const mockSession = { id: 1, userId, token, status: 'active' };

      sessionRepository.findOne.mockResolvedValue(mockSession as any);

      const result = await authService.validateSession(userId, token);

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { userId, token, status: 'active' },
      });
      expect(result).toBe(true);
    });

    it('should return false for an invalid session', async () => {
      const userId = '1';
      const token = 'invalid-token';

      sessionRepository.findOne.mockResolvedValue(null);

      const result = await authService.validateSession(userId, token);

      expect(result).toBe(false);
    });
  });
});
