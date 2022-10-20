import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/ormconfig';
import { OrganizationModule } from './organization/organization.module';
import { PractitionerModule } from './practitioner/practitioner.module';
import { PatientModule } from './patient/patient.module';
import { ExaminationModule } from './examination/examination.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './user/guards/jwt-auth.guard';
import { RolesGuard } from './user/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    OrganizationModule,
    PractitionerModule,
    PatientModule,
    ExaminationModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
