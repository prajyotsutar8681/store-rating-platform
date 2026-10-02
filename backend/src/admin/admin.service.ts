import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { ListStoresDto } from './dto/list-stores.dto';
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
    async createStore(createStoreDto: CreateStoreDto) {
        const owner = await this.prisma.user.findUnique({
            where: {
                id: createStoreDto.ownerId,
            },
        });

        if (!owner) {
            throw new NotFoundException(
                'Store owner with this ID was not found',
            );
        }

        if (owner.role !== Role.STORE_OWNER) {
            throw new BadRequestException(
                'Selected user must have the STORE_OWNER role',
            );
        }

        const existingStore = await this.prisma.store.findUnique({
            where: {
                email: createStoreDto.email,
            },
        });

        if (existingStore) {
            throw new ConflictException(
                'A store with this email already exists',
            );
        }

        const existingOwnerStore = await this.prisma.store.findUnique({
            where: {
                ownerId: createStoreDto.ownerId,
            },
        });

        if (existingOwnerStore) {
            throw new ConflictException(
                'This store owner already has a store',
            );
        }

        const store = await this.prisma.store.create({
            data: {
                name: createStoreDto.name,
                email: createStoreDto.email,
                address: createStoreDto.address,
                ownerId: createStoreDto.ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return {
            message: 'Store created successfully',
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                owner: store.owner,
                createdAt: store.createdAt,
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
    async getStores(query: ListStoresDto) {
        const {
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
        } = query;

        const where = search
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
            : {};

        const stores = await this.prisma.store.findMany({
            where,
            include: {
                ratings: {
                    select: {
                        rating: true,
                    },
                },
            },
        });

        const storesWithRating = stores.map((store) => {
            const totalRating = store.ratings.reduce(
                (sum, item) => sum + item.rating,
                0,
            );

            const averageRating =
                store.ratings.length > 0
                    ? totalRating / store.ratings.length
                    : 0;

            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                rating: Number(averageRating.toFixed(2)),
                createdAt: store.createdAt,
            };
        });

        const allowedSortFields = [
            'name',
            'email',
            'address',
            'rating',
            'createdAt',
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'createdAt';

        const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

        storesWithRating.sort((a, b) => {
            const valueA = a[safeSortBy as keyof typeof a];
            const valueB = b[safeSortBy as keyof typeof b];

            if (valueA === valueB) {
                return 0;
            }

            if (safeSortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            }

            return valueA < valueB ? 1 : -1;
        });

        const total = storesWithRating.length;
        const skip = (page - 1) * limit;

        const paginatedStores = storesWithRating.slice(
            skip,
            skip + limit,
        );

        return {
            data: paginatedStores,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },

        };
    }
    async getUserDetails(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                role: true,
                createdAt: true,
                ownedStore: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        address: true,
                        ratings: {
                            select: {
                                rating: true,
                                userId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(
                'User with this ID was not found',
            );
        }

        let averageRating: number | null = null;

        if (user.ownedStore) {
            const ratings = user.ownedStore.ratings;

            if (ratings.length > 0) {
                const total = ratings.reduce(
                    (sum, item) => sum + item.rating,
                    0,
                );

                averageRating = Number(
                    (total / ratings.length).toFixed(2),
                );
            } else {
                averageRating = 0;
            }
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            createdAt: user.createdAt,

            store: user.ownedStore
                ? {
                    id: user.ownedStore.id,
                    name: user.ownedStore.name,
                    email: user.ownedStore.email,
                    address: user.ownedStore.address,
                    averageRating,
                }
                : null,
        };
    }
}