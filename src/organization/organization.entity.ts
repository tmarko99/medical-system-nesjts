/* eslint-disable prettier/prettier */
import { OrganizationType } from './organization-type.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'organizations' })
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    identifier: string;

    @Column({ nullable: false })
    active: boolean;

    @ManyToOne(() => OrganizationType, (organizationType) => organizationType.organizations)
    type: OrganizationType;

    @Column({ nullable: false, unique: true })
    name: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @Column()
    email: string;
}