/* eslint-disable prettier/prettier */
import { IsEnum } from "class-validator";
import { Priority, Status } from "../examination.entity";

export class FilterDto {
  organization: number;
  patient: number;
  serviceType: number;
  @IsEnum(Status)
  status: string;
  @IsEnum(Priority)
  priority: string;
}
