import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be 20 to 60 characters' })
  fullName: string;

  @IsEmail({}, { message: 'Enter a valid email' })
  email: string;

  @IsString()
  @Length(1, 400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+]).{8,16}$/, {
    message: 'Password: 8-16 chars, one uppercase, one special character',
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}