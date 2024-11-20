import {
  Controller,
  Put,
  Param,
  Body,
  Delete,
  Post,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignRolesDto, DeleteRoleDto } from './role.entity';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('admin/users')
@ApiBearerAuth()
@ApiTags('User Management')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @ApiOperation({ summary: '*ADMIN ONLY* Assign roles to user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':userId/roles')
  async assignRoles(
    @Param('userId') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.userService.assignRoles(userId, assignRolesDto.roles);
  }

  @Roles('admin')
  @ApiOperation({ summary: '*ADMIN ONLY* Update roles of user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':userId/roles')
  async updateRoles(
    @Param('userId') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.userService.updateRoles(userId, assignRolesDto.roles);
  }

  @Roles('admin')
  @ApiOperation({ summary: '*ADMIN ONLY* Delete a single role of a user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':userId/roles')
  async removeRole(
    @Param('userId') userId: string,
    @Body() deleteRoleDto: DeleteRoleDto,
  ) {
    return this.userService.removeRole(userId, deleteRoleDto.role);
  }

  @Roles('admin')
  @ApiOperation({ summary: '*ADMIN ONLY* Get all users' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Partial search by email',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllUsers(@Query('search') search?: string): Promise<User[]> {
    return this.userService.getAllUsers(search);
  }
}
