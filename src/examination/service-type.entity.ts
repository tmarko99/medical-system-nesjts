/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_types' })
export class ServiceType {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;
}
