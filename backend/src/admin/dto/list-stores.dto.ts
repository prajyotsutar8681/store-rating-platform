import { IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListStoresDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'email' | 'address' | 'rating' | 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;
}