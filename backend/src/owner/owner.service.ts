import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getDashboard(ownerId: number) {
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
            ratings: store.ratings.map((item) => ({
                ratingId: item.id,
                rating: item.rating,
                user: item.user,
                ratedAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),
        };
    }
}