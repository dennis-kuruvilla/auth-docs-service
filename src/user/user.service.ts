import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async assignRoles(userId: string, roles: string[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const foundRoles = await this.roleRepository.find({
      where: { name: In(roles) },
    });
    if (foundRoles.length !== roles.length) {
      throw new NotFoundException('One or more roles not found');
    }

    user.roles = [...user.roles, ...foundRoles];

    return this.userRepository.save(user);
  }

  async updateRoles(userId: string, roles: string[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const foundRoles = await this.roleRepository.find({
      where: { name: In(roles) },
    });
    if (foundRoles.length !== roles.length) {
      throw new NotFoundException('One or more roles not found');
    }

    user.roles = foundRoles;

    return this.userRepository.save(user);
  }

  async removeRole(userId: string, roleName: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    user.roles = user.roles.filter((userRole) => userRole.id !== role.id);

    return this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({ relations: ['roles'] });
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
