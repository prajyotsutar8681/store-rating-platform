import {
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(16)
    currentPassword: string;

    @IsString()
    @MinLength(8)
    @MaxLength(16)
    @Matches(
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
        {
            message:
                'New password must contain at least one uppercase letter and one special character',
        },
    )
    newPassword: string;
}