import { Practitioner } from './practitioner.entity';
import { BackendValidationPipe } from 'src/shared/pipes/backend-validation.pipe';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { PractitionerService } from './practitioner.service';
import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Roles } from 'src/user/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';

@Controller('practitioner')
@UseGuards(RolesGuard)
@Roles(Role.Admin, Role.Practitioner)
export class PractitionerController {
  constructor(private readonly practitionerService: PractitionerService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('sortDir') sortDir: 'ASC' | 'DESC' = 'ASC',
    @Query('sortField') sortField = 'id',
  ): Promise<Pagination<any>> {
    limit = limit > 50 ? 50 : limit;
    return this.practitionerService.findAllPractitioners(
      { page, limit },
      sortDir,
      sortField,
    );
  }

  @Get('/:id')
  findById(@Param('id') id: number): Promise<Practitioner> {
    return this.practitionerService.findPractitionerById(id);
  }

  @Post()
  createPractitioner(
    @Body(BackendValidationPipe) practitionerDto: CreatePractitionerDto,
  ): Promise<{ message: string }> {
    return this.practitionerService.createPractitioner(practitionerDto);
  }

  @Put('/:id')
  updatePractitioner(
    @Param('id') id: number,
    @Body(BackendValidationPipe) practitionerDto: CreatePractitionerDto,
  ): Promise<any> {
    return this.practitionerService.updatePractitionerById(id, practitionerDto);
  }

  @Put('/delete/:id')
  deleteById(@Param('id') id: number): Promise<{ message: string }> {
    return this.practitionerService.deletePractitionerById(id);
  }
}
