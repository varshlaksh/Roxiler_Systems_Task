
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @Length(20, 60, { message: 'Store name must be 20 to 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Enter a valid email' })
  email: string;

  @IsString()
  @Length(1, 400, { message: 'Address cannot exceed 400 characters' })
  address: string;
}
