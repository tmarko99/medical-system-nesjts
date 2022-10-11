/* eslint-disable prettier/prettier */
import { Practitioner } from './../practitioner/practitioner.entity';
import { Examination } from './../examination/examination.entity';
import { Patient } from 'src/patient/patient.entity';
import { OrganizationType } from './organization-type.entity';
import { 
    Column, 
    Entity, 
    ManyToOne, 
    OneToMany, 
    PrimaryGeneratedColumn 
} from 'typeorm';

@Entity({ name: 'organizations' })
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    identifier: string;

    @Column({ nullable: false })
    active: boolean;

    @ManyToOne(() => OrganizationType, (organizationType) => organizationType.organizations, { eager: true })
    type: OrganizationType;

    @Column({ nullable: false, unique: true })
    name: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @OneToMany(() => Practitioner, (practitioner) => practitioner.organization, { eager: true })
    practitioners: Practitioner[];

    @OneToMany(() => Patient, (patient) => patient.organization, { eager: true })
    patients: Patient[];

    @OneToMany(() => Examination, (examination) => examination.organization)
    examinations: Examination[];

    @Column()
    typeId: number;
}
