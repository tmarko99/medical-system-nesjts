import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/ormconfig';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [TypeOrmModule.forRoot(config), OrganizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
