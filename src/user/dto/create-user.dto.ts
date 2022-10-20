/* eslint-disable prettier/prettier */
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../role.enum';

export class CreateUserDto {
  firstName: string;

  lastName: string;
  
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(Role)
  role: string;
}
