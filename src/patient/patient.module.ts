import { PractitionerModule } from './../practitioner/practitioner.module';
import { OrganizationModule } from './../organization/organization.module';
import { Patient } from 'src/patient/patient.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),
    OrganizationModule,
    PractitionerModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
