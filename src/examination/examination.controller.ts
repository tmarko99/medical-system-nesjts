import { FilterDto } from './dto/filter.dto';
import { Examination } from './examination.entity';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { BackendValidationPipe } from 'src/shared/pipes/backend-validation.pipe';
import { ExaminationService } from './examination.service';
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
import { Pagination } from 'nestjs-typeorm-paginate';
import { UpdateExamination } from './types/update.examination.type';

@Controller('examination')
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  @Post('/filter')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('sortDir') sortDir: 'ASC' | 'DESC' = 'ASC',
    @Query('sortField') sortField = 'id',
    @Body(BackendValidationPipe) filterDto: FilterDto,
  ): Promise<Pagination<Examination>> {
    limit = limit > 50 ? 50 : limit;
    return this.examinationService.findAllExaminations(
      { page, limit },
      sortDir,
      sortField,
      filterDto,
    );
  }

  @Get('/:id')
  findById(@Param('id') id: number): Promise<Examination> {
    return this.examinationService.findExaminationById(id);
  }

  @Post()
  createExamination(
    @Body(BackendValidationPipe) createExaminationDto: CreateExaminationDto,
  ) {
    return this.examinationService.createExamination(createExaminationDto);
  }

  @Put('/:id')
  updateExamination(
    @Param('id') id: number,
    @Body(BackendValidationPipe) updateExaminationDto: UpdateExamination,
  ) {
    return this.examinationService.updateExamination(id, updateExaminationDto);
  }

  @Put('/delete/:id')
  deleteById(@Param('id') id: number): Promise<{ message: string }> {
    return this.examinationService.deleteExaminationById(id);
  }
}
