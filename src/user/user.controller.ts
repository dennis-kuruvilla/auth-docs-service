import {
  Controller,
  Put,
  Param,
  Body,
  Delete,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignRolesDto, DeleteRoleDto } from './role.entity';
import { UserService } from './user.service';

@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':userId/roles')
  async assignRoles(
    @Param('userId') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.userService.assignRoles(userId, assignRolesDto.roles);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':userId/roles')
  async updateRoles(
    @Param('userId') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.userService.updateRoles(userId, assignRolesDto.roles);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':userId/roles')
  async removeRole(
    @Param('userId') userId: string,
    @Body() deleteRoleDto: DeleteRoleDto,
  ) {
    return this.userService.removeRole(userId, deleteRoleDto.role);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
