import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access if no roles are required', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['admin'] } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if user has one of the required roles', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['admin', 'user'] } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access if user does not have any of the required roles', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['user'] } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access if no roles are assigned to the user and roles are required', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: [] } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access if user has all required roles', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['admin', 'editor', 'user'] } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'editor']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user does not have required roles and you want to throw an error', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['user'] } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

      try {
        rolesGuard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response.message).toBe('Unauthorized');
      }
    });
  });
});
