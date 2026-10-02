import {
    IsEnum,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Role } from '../../generated/prisma/client';

export class ListUsersDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'email' | 'address' | 'role' | 'createdAt';

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