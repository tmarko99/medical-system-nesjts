import { Patient } from 'src/patient/patient.entity';
import { BackendValidationPipe } from 'src/shared/pipes/backend-validation.pipe';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientService } from './patient.service';
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('sortDir') sortDir: 'ASC' | 'DESC' = 'ASC',
    @Query('sortField') sortField = 'id',
  ): Promise<Pagination<Patient>> {
    limit = limit > 50 ? 50 : limit;
    return this.patientService.findAllPatients(
      { page, limit },
      sortDir,
      sortField,
    );
  }

  @Get('/:id')
  findById(@Param('id') id: number): Promise<Patient> {
    return this.patientService.findPatientById(id);
  }

  @Post()
  createPatient(
    @Body(BackendValidationPipe) createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.createPatient(createPatientDto);
  }

  @Put('/:id')
  updatePatient(
    @Param('id') id: number,
    @Body(BackendValidationPipe) patientDto: CreatePatientDto,
  ): Promise<any> {
    return this.patientService.updatePatientById(id, patientDto);
  }

  @Put('/delete/:id')
  deleteById(@Param('id') id: number): Promise<{ message: string }> {
    return this.patientService.deletePatientById(id);
  }
}
