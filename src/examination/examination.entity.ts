/* eslint-disable prettier/prettier */
import { Organization } from 'src/organization/organization.entity';
import { Patient } from 'src/patient/patient.entity';
import { ServiceType } from './service-type.entity';
import { Practitioner } from './../practitioner/practitioner.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Status {
  PLANNED = 'planned',
  TRIAGED = 'triaged',
  IN_PROGRESS = 'in progress',
  SUSPENDED = 'suspended',
  FINISHED = 'finished',
  CANCELED = 'canceled',
  ENTERED_IN_ERROR = 'entered in error',
}

export enum Priority {
  ASAS = 'Asap',
  CALLBACK_RESULTS = 'callback results',
  EMERGENCY = 'emergency',
  ROUTINE = 'routine',
  RUSH_REPORT = 'rush report',
  TIMING_CRITICAL = 'timing critical',
}

@Entity({ name: 'examinations' })
export class Examination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: false,
  })
  status: string;

  @Column({
    type: 'enum',
    enum: Priority,
  })
  priority: string;

  @ManyToOne(() => ServiceType)
  @JoinColumn({ name: 'service_type_id', referencedColumnName: 'id'})
  serviceType: ServiceType;

  @Column({ type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', name: 'end_date' })
  endDate: Date;

  @Column()
  diagnosis: string;

  @ManyToMany(() => Practitioner, (practitioner) => practitioner.examinations, { cascade: true })
  @JoinTable({ 
    name: 'examinations_practitioners', 
    joinColumn: { 
        name: 'examination_id', 
        referencedColumnName: 'id'
    }, 
    inverseJoinColumn: { 
        name: 'practitioner_id', 
        referencedColumnName: 'id'
    }
  })
  practitioners: Practitioner[];

  @ManyToOne(() => Patient, (patient) => patient.examinations)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  patient: Patient;

  @ManyToOne(() => Organization, (organization) => organization.examinations)
  organization: Organization;

  @JoinColumn({ name: 'organization_id'})
  organizationId: number;

  @JoinColumn({ name: 'patient_id'})
  patientId: number;

  @JoinColumn({ name: 'service_type_id'})
  serviceTypeId: number;
}
