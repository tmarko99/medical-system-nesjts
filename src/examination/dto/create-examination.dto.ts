/* eslint-disable prettier/prettier */
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { Priority, Status } from '../examination.entity';

export class CreateExaminationDto {
  @IsNotEmpty()
  identifier: string;

  @IsEnum(Status)
  status: string;

  @IsEnum(Priority)
  priority: string;

  @IsNotEmpty()
  serviceTypeId: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  diagnosis: string;

  @IsNotEmpty()
  practitionersIds: number[];

  @IsNotEmpty()
  patientId: number;

  @IsNotEmpty()
  organizationId: number;
}
