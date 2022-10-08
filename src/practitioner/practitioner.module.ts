import { OrganizationModule } from './../organization/organization.module';
import { Organization } from './../organization/organization.entity';
import { Practitioner } from './practitioner.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PractitionerController } from './practitioner.controller';
import { PractitionerService } from './practitioner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Practitioner, Organization]),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [PractitionerController],
  providers: [PractitionerService],
  exports: [PractitionerService],
})
export class PractitionerModule {}
