import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/ormconfig';
import { OrganizationModule } from './organization/organization.module';
import { PractitionerModule } from './practitioner/practitioner.module';
import { PatientModule } from './patient/patient.module';
import { ExaminationModule } from './examination/examination.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    OrganizationModule,
    PractitionerModule,
    PatientModule,
    ExaminationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
