import {
    Controller,
    Get,
    UseGuards,
    Query,
} from '@nestjs/common';

import { ListOwnerRatingsDto } from './dto/list-owner-ratings.dto';
import { Role } from '../generated/prisma/client';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { OwnerService } from './owner.service';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STORE_OWNER)
export class OwnerController {
    constructor(
        private readonly ownerService: OwnerService,
    ) { }

    @Get('dashboard')
    getDashboard(
        @CurrentUser() user: { sub: number },
        @Query() query: ListOwnerRatingsDto,
    ) {
        return this.ownerService.getDashboard(
            user.sub,
            query,
        );
    }
}