import { IsString, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+]).{8,16}$/, {
    message: 'New password: 8-16 chars, one uppercase, one special character',
  })
  newPassword: string;
}