import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { name, email, address, password } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                address,
                password: hashedPassword,
                role: Role.USER,
            },
        });

        return {
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
            },
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
            },
        };
    }

    async changePassword(
        userId: number,
        changePasswordDto: ChangePasswordDto,
    ) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new UnauthorizedException(
                'User not found',
            );
        }

        const passwordMatches = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.password,
        );

        if (!passwordMatches) {
            throw new BadRequestException(
                'Current password is incorrect',
            );
        }

        const newPasswordMatchesCurrent =
            await bcrypt.compare(
                changePasswordDto.newPassword,
                user.password,
            );

        if (newPasswordMatchesCurrent) {
            throw new BadRequestException(
                'New password must be different from the current password',
            );
        }

        const hashedPassword = await bcrypt.hash(
            changePasswordDto.newPassword,
            12,
        );

        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        return {
            message: 'Password changed successfully',
        };
    }
}