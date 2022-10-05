/* eslint-disable prettier/prettier */
import { OrganizationType } from './../organization-type.entity';

export class OrganizationResponse {
  id: number;

  identifier: string;

  active: boolean;

  type: OrganizationType;

  name: string;

  address: string;

  phone: string;

  email: string;
}
