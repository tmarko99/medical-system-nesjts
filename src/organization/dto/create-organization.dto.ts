/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  active: boolean;

  @IsNotEmpty()
  type: number;

  @IsNotEmpty()
  @MinLength(5, { message: 'Minimal number of characters is 5' })
  name: string;

  address: string;
  
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
