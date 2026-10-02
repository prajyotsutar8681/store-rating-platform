import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { Role } from '../generated/prisma/client';

import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@Req() request: any) {
        return {
            user: request.user,
        };
    }

    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    changePassword(
        @CurrentUser() user: { sub: number },
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(
            user.sub,
            changePasswordDto,
        );
    }

    @Get('admin-test')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    adminTest() {
        return {
            message: 'You have ADMIN access',
        };
    }
}