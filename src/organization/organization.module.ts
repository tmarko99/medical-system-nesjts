import { PatientModule } from './../patient/patient.module';
import { Examination } from './../examination/examination.entity';
import { PractitionerModule } from './../practitioner/practitioner.module';
import { OrganizationController } from './organization.controller';
import { OrganizationType } from './organization-type.entity';
import { Organization } from './organization.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationType, Examination]),
    forwardRef(() => PractitionerModule),
    forwardRef(() => PatientModule),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
