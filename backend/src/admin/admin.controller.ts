import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { Role } from '../generated/prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    getDashboard() {
        return this.adminService.getDashboard();
    }

    @Post('users')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.adminService.createUser(createUserDto);
    }

    @Get('users')
    getUsers(@Query() query: ListUsersDto) {
        return this.adminService.getUsers(query);
    }
}