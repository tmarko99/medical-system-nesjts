/* eslint-disable prettier/prettier */
import { Organization } from 'src/organization/organization.entity';
import { Practitioner } from './../practitioner/practitioner.entity';
import { Gender } from 'src/shared/enums/gender.enum';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum MaritalStatus {
    ANNULLED = 'Annuled',
    DIVORCED = 'Divorced',
    MARRIED = 'Married',
    POLYGAMOUS = 'Polygamous',
    NEVER_MARRIED = 'Never Married',
    WIDOWED = 'Widowed'
}

@Entity({ name: 'patients' })
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string;

  @Column({ nullable: false })
  active: boolean;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  surname: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: string;

  @Column({ type: 'date', nullable: false, name: 'birth_date' })
  birthDate: Date;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ default: false })
  deceased: boolean;

  @Column({ name: 'marital_status', type: 'enum', enum: MaritalStatus })
  maritalStatus: string;

  @ManyToOne(() => Organization, (organization) => organization.patients)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @Column()
  organizationId: number;

  @Column()
  practitionerId: number;
}
