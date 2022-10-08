import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationService } from './organization.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BackendValidationPipe } from 'src/shared/pipes/backend-validation.pipe';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Organization } from './organization.entity';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('sortDir') sortDir: 'ASC' | 'DESC' = 'ASC',
    @Query('sortField') sortField = 'id',
  ): Promise<Pagination<Organization>> {
    limit = limit > 50 ? 50 : limit;
    return this.organizationService.findAllOrganizations(
      { page, limit },
      sortDir,
      sortField,
    );
  }

  @Get('/:id')
  findById(@Param('id') id: number): Promise<Organization> {
    return this.organizationService.findOrganizationById(id);
  }

  @Post()
  createOrganization(
    @Body(BackendValidationPipe) organizationDto: CreateOrganizationDto,
  ): Promise<{ message: string }> {
    return this.organizationService.createOrganization(organizationDto);
  }

  @Put('/:id')
  updateOrganization(
    @Param('id') id: number,
    @Body(BackendValidationPipe) newOrganization: CreateOrganizationDto,
  ): Promise<{ message: string }> {
    return this.organizationService.updateOrganizationById(id, newOrganization);
  }

  @Put('/delete/:id')
  deleteById(@Param('id') id: number): Promise<{ message: string }> {
    return this.organizationService.deleteOrganizationById(id);
  }
}
