/* eslint-disable prettier/prettier */
import { Organization } from 'src/organization/organization.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'OTHER',
    UNKNOWN = 'Unknown'
}

export enum QualificationType {
    DOCTOR_OF_MEDICINE = 'Doctor of Medicine',
    MEDICAL_ASSISTANT = 'Medical Assistant',
    NURSE_PRACTITIONER = 'Nurse Practitioner',
    DOCTOR_OF_PHARMACY = 'Doctor of Pharmacy',
    CERTIFIED_NURSE_MIDWIFE = 'Certified Nurse Midwife',
    EMERGENCY_MEDICAL_TECHNICIAN = 'Emergency Medical Technician'
}

@Entity({ name: 'practitioners' })
export class Practitioner {
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
    type: "enum",
    enum: Gender
  })
  gender: string;

  @Column({ type: 'date', nullable: false })
  birthDate: Date;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: false, type: 'enum', enum: QualificationType })
  qualification: string;

  @ManyToOne(() => Organization, (organization) => organization.practitioners)
  organization: Organization;

  @Column()
  organizationId: number;
}
