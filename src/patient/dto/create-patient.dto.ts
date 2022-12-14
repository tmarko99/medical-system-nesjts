/* eslint-disable prettier/prettier */
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { MaritalStatus } from './../patient.entity';
import { Gender } from 'src/shared/enums/gender.enum';

export class CreatePatientDto {
  @IsNotEmpty()
  @MinLength(5, { message: 'Minimal number of characters is 5' })
  identifier: string;

  @IsNotEmpty()
  active: boolean;

  @IsNotEmpty()
  @MinLength(3, { message: 'Minimal number of characters is 3' })
  name: string;

  @IsNotEmpty()
  @MinLength(3, { message: 'Minimal number of characters is 3' })
  surname: string;

  @IsEnum(Gender)
  gender: string;

  @IsDateString()
  birthDate: Date;

  address: string;

  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  deceased: boolean;

  @IsEnum(MaritalStatus)
  maritalStatus: string;

  @IsNotEmpty()
  practitionerId: number;

  @IsNotEmpty()
  organizationId: number;
}
