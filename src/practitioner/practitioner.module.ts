import { OrganizationModule } from './../organization/organization.module';
import { Organization } from './../organization/organization.entity';
import { Practitioner } from './practitioner.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PractitionerController } from './practitioner.controller';
import { PractitionerService } from './practitioner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Practitioner, Organization]),
    OrganizationModule,
  ],
  controllers: [PractitionerController],
  providers: [PractitionerService],
})
export class PractitionerModule {}
