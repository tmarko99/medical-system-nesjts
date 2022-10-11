import { PractitionerModule } from './../practitioner/practitioner.module';
import { OrganizationModule } from './../organization/organization.module';
import { Patient } from 'src/patient/patient.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),
    forwardRef(() => OrganizationModule),
    forwardRef(() => PractitionerModule),
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
