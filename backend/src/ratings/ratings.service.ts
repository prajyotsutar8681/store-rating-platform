import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
    constructor(private readonly prisma: PrismaService) { }

    async createRating(
        userId: number,
        createRatingDto: CreateRatingDto,
    ) {
        const { storeId, rating } = createRatingDto;

        const store = await this.prisma.store.findUnique({
            where: {
                id: storeId,
            },
        });

        if (!store) {
            throw new NotFoundException(
                'Store with this ID was not found',
            );
        }

        const existingRating = await this.prisma.rating.findUnique({
            where: {
                userId_storeId: {
                    userId,
                    storeId,
                },
            },
        });

        if (existingRating) {
            throw new ConflictException(
                'You have already rated this store',
            );
        }

        const createdRating = await this.prisma.rating.create({
            data: {
                rating,
                userId,
                storeId,
            },
        });

        return {
            message: 'Rating submitted successfully',
            rating: createdRating,
        };
    }

    async updateRating(
        userId: number,
        storeId: number,
        updateRatingDto: UpdateRatingDto,
    ) {
        const existingRating = await this.prisma.rating.findUnique({
            where: {
                userId_storeId: {
                    userId,
                    storeId,
                },
            },
        });

        if (!existingRating) {
            throw new NotFoundException(
                'You have not rated this store yet',
            );
        }

        const updatedRating = await this.prisma.rating.update({
            where: {
                userId_storeId: {
                    userId,
                    storeId,
                },
            },
            data: {
                rating: updateRatingDto.rating,
            },
        });

        return {
            message: 'Rating updated successfully',
            rating: updatedRating,
        };
    }
}