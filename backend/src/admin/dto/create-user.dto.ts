import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

import { Role } from '../../generated/prisma/client';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(60)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(400)
    address: string;

    @IsString()
    @MinLength(8)
    @MaxLength(16)
    @Matches(
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
        {
            message:
                'Password must contain at least one uppercase letter and one special character',
        },
    )
    password: string;

    @IsEnum(Role)
    role: Role;
}