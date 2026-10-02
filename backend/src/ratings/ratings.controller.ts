import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../auth/current-user.decorator';

import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
    constructor(
        private readonly ratingsService: RatingsService,
    ) { }

    @Post()
    createRating(
        @CurrentUser() user: { sub: number },
        @Body() createRatingDto: CreateRatingDto,
    ) {
        return this.ratingsService.createRating(
            user.sub,
            createRatingDto,
        );
    }

    @Patch(':storeId')
    updateRating(
        @CurrentUser() user: { sub: number },
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() updateRatingDto: UpdateRatingDto,
    ) {
        return this.ratingsService.updateRating(
            user.sub,
            storeId,
            updateRatingDto,
        );
    }
}