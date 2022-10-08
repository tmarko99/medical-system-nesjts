/* eslint-disable prettier/prettier */
import { Organization } from 'src/organization/organization.entity';
import { Patient } from 'src/patient/patient.entity';
import { Gender } from 'src/shared/enums/gender.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'date', nullable: false, name: 'birth_date' })
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
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Patient, (patient) => patient.practitioner)
  patients: Patient[];

  @Column()
  organizationId: number;
}
