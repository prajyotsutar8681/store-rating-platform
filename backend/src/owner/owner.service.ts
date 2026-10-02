import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ListOwnerRatingsDto } from './dto/list-owner-ratings.dto';

@Injectable()
export class OwnerService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getDashboard(
        ownerId: number,
        query: ListOwnerRatingsDto,
    ) {
        const store = await this.prisma.store.findUnique({
            where: {
                ownerId,
            },
            include: {
                ratings: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                address: true,
                            },
                        },
                    },
                },
            },
        });

        if (!store) {
            throw new NotFoundException(
                'No store is associated with this store owner',
            );
        }

        const totalRating = store.ratings.reduce(
            (sum, item) => sum + item.rating,
            0,
        );

        const averageRating =
            store.ratings.length > 0
                ? totalRating / store.ratings.length
                : 0;
        const {
            sortBy = 'ratedAt',
            sortOrder = 'desc',
        } = query;

        const ratings = store.ratings.map((item) => ({
            ratingId: item.id,
            rating: item.rating,
            user: item.user,
            ratedAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        const allowedSortFields = [
            'name',
            'rating',
            'ratedAt',
        ] as const;

        const safeSortBy = allowedSortFields.includes(
            sortBy as (typeof allowedSortFields)[number],
        )
            ? sortBy
            : 'ratedAt';

        const safeSortOrder =
            sortOrder === 'asc' ? 'asc' : 'desc';

        ratings.sort((a, b) => {
            let valueA: string | number | Date;
            let valueB: string | number | Date;

            if (safeSortBy === 'name') {
                valueA = a.user.name.toLowerCase();
                valueB = b.user.name.toLowerCase();
            } else if (safeSortBy === 'rating') {
                valueA = a.rating;
                valueB = b.rating;
            } else {
                valueA = a.ratedAt;
                valueB = b.ratedAt;
            }

            if (valueA === valueB) {
                return 0;
            }

            if (safeSortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            }

            return valueA < valueB ? 1 : -1;
        });
        return {
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
            },
            averageRating: Number(
                averageRating.toFixed(2),
            ),
            totalRatings: store.ratings.length,
            ratings,
        };
    }
}