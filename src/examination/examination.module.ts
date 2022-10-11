import { Practitioner } from './../practitioner/practitioner.entity';
import { PatientModule } from './../patient/patient.module';
import { ServiceType } from './service-type.entity';
import { Examination } from './examination.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { ExaminationController } from './examination.controller';
import { ExaminationService } from './examination.service';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Examination, ServiceType, Practitioner]),
    forwardRef(() => OrganizationModule),
    forwardRef(() => PatientModule),
  ],
  controllers: [ExaminationController],
  providers: [ExaminationService],
})
export class ExaminationModule {}
