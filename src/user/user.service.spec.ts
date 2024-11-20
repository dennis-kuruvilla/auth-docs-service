import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { In, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('assignRoles', () => {
    it('should assign roles to a user successfully', async () => {
      const userId = 'user-id';
      const roles = ['admin', 'editor'];
      const mockUser = { id: 'user-id', roles: [] };
      const mockRoles = roles.map((roleName) => ({
        id: roleName,
        name: roleName,
      }));

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(roleRepository, 'find').mockResolvedValue(mockRoles as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);

      const result = await userService.assignRoles(userId, roles);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(roleRepository.find).toHaveBeenCalledWith({
        where: { name: In(roles) },
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';
      const roles = ['admin'];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      try {
        await userService.assignRoles(userId, roles);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw NotFoundException if one or more roles not found', async () => {
      const userId = 'user-id';
      const roles = ['admin', 'invalidRole'];

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 'user-id', roles: [] } as any);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([{ id: 'admin', name: 'admin' }] as any);

      try {
        await userService.assignRoles(userId, roles);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('One or more roles not found');
      }
    });
  });

  describe('updateRoles', () => {
    it('should update roles for a user successfully', async () => {
      const userId = 'user-id';
      const roles = ['admin', 'editor'];
      const mockUser = { id: 'user-id', roles: ['user'] };
      const mockRoles = roles.map((roleName) => ({
        id: roleName,
        name: roleName,
      }));

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(roleRepository, 'find').mockResolvedValue(mockRoles as any);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...mockUser, roles: mockRoles } as User);

      const result = await userService.updateRoles(userId, roles);

      expect(result).toEqual({ ...mockUser, roles: mockRoles });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(roleRepository.find).toHaveBeenCalledWith({
        where: { name: In(roles) },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        roles: mockRoles,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';
      const roles = ['admin'];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      try {
        await userService.updateRoles(userId, roles);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw NotFoundException if one or more roles not found', async () => {
      const userId = 'user-id';
      const roles = ['admin', 'invalidRole'];

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 'user-id', roles: [] } as any);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([{ id: 'admin', name: 'admin' }] as any);

      try {
        await userService.updateRoles(userId, roles);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('One or more roles not found');
      }
    });
  });

  describe('removeRole', () => {
    it('should remove a role from a user successfully', async () => {
      const userId = 'user-id';
      const roleName = 'admin';
      const mockUser = {
        id: 'user-id',
        roles: [{ id: 'admin', name: 'admin' }],
      } as any;
      const mockRole = { id: 'admin', name: 'admin' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await userService.removeRole(userId, roleName);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { name: roleName },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        roles: [],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';
      const roleName = 'admin';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      try {
        await userService.removeRole(userId, roleName);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw NotFoundException if role not found', async () => {
      const userId = 'user-id';
      const roleName = 'admin';

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 'user-id', roles: [] } as any);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      try {
        await userService.removeRole(userId, roleName);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Role not found');
      }
    });
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [{ id: 'user-id', roles: ['admin'] }];
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers as any);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalledWith({
        relations: ['roles'],
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID successfully', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, roles: ['admin'] };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['roles'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      try {
        await userService.getUserById(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });
  });
});
