import {
    IsEmail,
    IsInt,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateStoreDto {
    @IsString()
    @MinLength(20)
    @MaxLength(60)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(400)
    address: string;

    @IsInt()
    ownerId: number;
}