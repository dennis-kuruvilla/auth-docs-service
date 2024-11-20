import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            assignRoles: jest.fn(),
            updateRoles: jest.fn(),
            removeRole: jest.fn(),
            getAllUsers: jest.fn(),
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('assignRoles', () => {
    it('should assign roles to a user successfully', async () => {
      const userId = 'user-id';
      const assignRolesDto = { roles: ['admin', 'editor'] };
      const mockUser = { id: 'user-id', roles: [] };

      userService.assignRoles = jest.fn().mockResolvedValue(mockUser);

      const result = await userController.assignRoles(userId, assignRolesDto);

      expect(result).toEqual(mockUser);
      expect(userService.assignRoles).toHaveBeenCalledWith(
        userId,
        assignRolesDto.roles,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';
      const assignRolesDto = { roles: ['admin'] };

      userService.assignRoles = jest
        .fn()
        .mockRejectedValue(new NotFoundException('User not found'));

      try {
        await userController.assignRoles(userId, assignRolesDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateRoles', () => {
    it('should update roles for a user successfully', async () => {
      const userId = 'user-id';
      const assignRolesDto = { roles: ['admin', 'editor'] };
      const mockUser = { id: 'user-id', roles: ['admin'] };

      userService.updateRoles = jest.fn().mockResolvedValue(mockUser);

      const result = await userController.updateRoles(userId, assignRolesDto);

      expect(result).toEqual(mockUser);
      expect(userService.updateRoles).toHaveBeenCalledWith(
        userId,
        assignRolesDto.roles,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';
      const assignRolesDto = { roles: ['admin'] };

      userService.updateRoles = jest
        .fn()
        .mockRejectedValue(new NotFoundException('User not found'));

      try {
        await userController.updateRoles(userId, assignRolesDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('removeRole', () => {
    it('should remove a role from a user successfully', async () => {
      const userId = 'user-id';
      const deleteRoleDto = { role: 'admin' };
      const mockUser = { id: 'user-id', roles: ['admin'] };

      userService.removeRole = jest.fn().mockResolvedValue(mockUser);

      const result = await userController.removeRole(userId, deleteRoleDto);

      expect(result).toEqual(mockUser);
      expect(userService.removeRole).toHaveBeenCalledWith(
        userId,
        deleteRoleDto.role,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';
      const deleteRoleDto = { role: 'admin' };

      userService.removeRole = jest
        .fn()
        .mockRejectedValue(new NotFoundException('User not found'));

      try {
        await userController.removeRole(userId, deleteRoleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException if role not found', async () => {
      const userId = 'user-id';
      const deleteRoleDto = { role: 'admin' };

      userService.removeRole = jest
        .fn()
        .mockRejectedValue(new NotFoundException('Role not found'));

      try {
        await userController.removeRole(userId, deleteRoleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [{ id: 'user-id', roles: ['admin'] }];
      userService.getAllUsers = jest.fn().mockResolvedValue(mockUsers);

      const result = await userController.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(userService.getAllUsers).toHaveBeenCalled();
    });
  });
});
