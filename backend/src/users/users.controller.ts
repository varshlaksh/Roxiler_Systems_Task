import {
  Body, Controller, Get, Param,
  Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public — anyone can sign up
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.usersService.signup(dto);
  }

  // Admin only — can create any role
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  createByAdmin(@Body() dto: CreateUserDto) {
    return this.usersService.createByAdmin(dto);
  }

  // Admin only — filterable + sortable list
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    return this.usersService.findAll({ name, email, address, role }, sortBy, order);
  }

  // Any authenticated user — change own password
  @Patch('password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  // Admin only — view single user detail
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }
}