import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboard() {
        const [totalUsers, totalStores, totalRatings] =
            await Promise.all([
                this.prisma.user.count(),
                this.prisma.store.count(),
                this.prisma.rating.count(),
            ]);

        return {
            totalUsers,
            totalStores,
            totalRatings,
        };
    }

    async createUser(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: createUserDto.email,
            },
        });

        if (existingUser) {
            throw new ConflictException(
                'A user with this email already exists',
            );
        }

        const hashedPassword = await bcrypt.hash(
            createUserDto.password,
            12,
        );

        const user = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                address: createUserDto.address,
                password: hashedPassword,
                role: createUserDto.role,
            },
        });

        return {
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt,
            },
        };
    }

    async getUsers(query: ListUsersDto) {
        const {
            search,
            role,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
        } = query;

        const where = {
            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            address: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                    ],
                }
                : {}),

            ...(role ? { role } : {}),
        };

        const allowedSortFields = [
            'name',
            'email',
            'address',
            'role',
            'createdAt',
        ] as const;

        const safeSortBy = allowedSortFields.includes(
            sortBy as (typeof allowedSortFields)[number],
        )
            ? sortBy
            : 'createdAt';

        const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    address: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: {
                    [safeSortBy]: safeSortOrder,
                },
                skip,
                take: limit,
            }),

            this.prisma.user.count({
                where,
            }),
        ]);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}