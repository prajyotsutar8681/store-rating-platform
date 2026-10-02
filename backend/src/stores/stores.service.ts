import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { ListStoresDto } from './dto/list-stores.dto';

@Injectable()
export class StoresService {
    constructor(private readonly prisma: PrismaService) { }

    async getStores(
        userId: number,
        query: ListStoresDto,
    ) {
        const {
            search,
            sortBy = 'name',
            sortOrder = 'asc',
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
                        userId: true,
                    },
                },
            },
        });

        const storesWithRatings = stores.map((store) => {
            const totalRating = store.ratings.reduce(
                (sum, item) => sum + item.rating,
                0,
            );

            const averageRating =
                store.ratings.length > 0
                    ? totalRating / store.ratings.length
                    : 0;

            const userRating = store.ratings.find(
                (item) => item.userId === userId,
            );

            return {
                id: store.id,
                name: store.name,
                address: store.address,
                overallRating: Number(
                    averageRating.toFixed(2),
                ),
                userRating: userRating
                    ? userRating.rating
                    : null,
            };
        });

        const allowedSortFields = [
            'name',
            'address',
            'rating',
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'name';

        const safeSortOrder =
            sortOrder === 'desc' ? 'desc' : 'asc';

        storesWithRatings.sort((a, b) => {
            let valueA: string | number;
            let valueB: string | number;

            if (safeSortBy === 'rating') {
                valueA = a.overallRating;
                valueB = b.overallRating;
            } else {
                valueA =
                    a[safeSortBy as 'name' | 'address'];
                valueB =
                    b[safeSortBy as 'name' | 'address'];
            }

            if (valueA === valueB) {
                return 0;
            }

            if (safeSortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            }

            return valueA < valueB ? 1 : -1;
        });

        const total = storesWithRatings.length;
        const skip = (page - 1) * limit;

        const paginatedStores = storesWithRatings.slice(
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
}