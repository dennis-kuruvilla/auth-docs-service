import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = { email: 'test@example.com', password: 'password' };
      const savedUser = { id: 1, email: registerDto.email };
      jest.spyOn(authService, 'register').mockResolvedValue(savedUser as any);

      const result = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(savedUser);
    });

    it('should throw an error if the user already exists', async () => {
      const registerDto = { email: 'test@example.com', password: 'password' };
      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new HttpException('User already exists', 400));

      await expect(authController.register(registerDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('login', () => {
    it('should login a user and return an access token', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const token = { accessToken: 'jwt-token' };
      jest.spyOn(authService, 'login').mockResolvedValue(token);

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(token);
    });

    it('should throw an UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'invalid@example.com', password: 'wrongpass' };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should log out a user with a valid session', async () => {
      const req = {
        user: { userId: '1' },
        headers: { authorization: 'Bearer jwt-token' },
      };
      jest.spyOn(authService, 'logout').mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await authController.logout(req);

      expect(authService.logout).toHaveBeenCalledWith('1', 'jwt-token');
      expect(result).toEqual({ message: 'Logout successful' });
    });

    it('should throw an UnauthorizedException for an invalid session', async () => {
      const req = {
        user: { userId: '1' },
        headers: { authorization: 'Bearer invalid-token' },
      };
      jest
        .spyOn(authService, 'logout')
        .mockRejectedValue(new UnauthorizedException('Invalid session'));

      await expect(authController.logout(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('testAuth', () => {
    it('should return "auth is working fine"', () => {
      expect(authController.testAuth()).toEqual('auth is working fine');
    });
  });
});
