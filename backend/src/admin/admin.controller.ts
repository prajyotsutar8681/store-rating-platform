import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { Role } from '../generated/prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListStoresDto } from './dto/list-stores.dto';

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

    @Post('stores')
    createStore(@Body() createStoreDto: CreateStoreDto) {
        return this.adminService.createStore(createStoreDto);
    }

    @Get('users')
    getUsers(@Query() query: ListUsersDto) {
        return this.adminService.getUsers(query);
    }

    @Get('stores')
    getStores(@Query() query: ListStoresDto) {
        return this.adminService.getStores(query);
    }

    @Get('users/:id')
    getUserDetails(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.adminService.getUserDetails(id);
    }
}