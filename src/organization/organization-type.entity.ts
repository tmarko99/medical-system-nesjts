/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum OrganizationTypes {
    HOSPITAL = "Hospital",
    INSURANCE_COMPANY = "Insurance Company",
    EDUCATIONAL_INSTITUTE = "Educational Institute",
    CLINICAL_RESEARCH = "Clinical Research",
    OTHER = "Other"
}

@Entity()
export class OrganizationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: OrganizationTypes
  })
  name: OrganizationTypes;

  @OneToMany(() => Organization, (organization) => organization.type)
  organizations: Organization[]
}
