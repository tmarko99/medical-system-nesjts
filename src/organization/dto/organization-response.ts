/* eslint-disable prettier/prettier */
import { Expose, Transform } from 'class-transformer';

export class OrganizationResponse {
  @Expose()
  id: number;

  @Expose()
  identifier: string;

  @Expose()
  active: boolean;

  @Transform(({ obj }) => obj.type.name)
  @Expose()
  type: string;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Transform(({ obj }) => obj.practitioners.length)
  @Expose()
  numberOfPractitioners: number;
}
