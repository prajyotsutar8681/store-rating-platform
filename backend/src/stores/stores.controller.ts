import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { StoresService } from './stores.service';
import { ListStoresDto } from './dto/list-stores.dto';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
    constructor(
        private readonly storesService: StoresService,
    ) { }

    @Get()
    getStores(
        @CurrentUser() user: { sub: number },
        @Query() query: ListStoresDto,
    ) {
        return this.storesService.getStores(
            user.sub,
            query,
        );
    }
}