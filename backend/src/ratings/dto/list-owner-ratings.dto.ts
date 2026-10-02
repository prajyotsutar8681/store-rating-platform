import { IsOptional, IsString } from 'class-validator';

export class ListOwnerRatingsDto {
    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'rating' | 'ratedAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';
}