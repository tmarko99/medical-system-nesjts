import {
  IPaginationOptions,
  paginateRaw,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Practitioner } from './../practitioner/practitioner.entity';
import { ServiceType } from './service-type.entity';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { Examination, Status } from './examination.entity';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationService } from 'src/organization/organization.service';
import { PatientService } from 'src/patient/patient.service';
import { FilterDto } from './dto/filter.dto';
import { UpdateExamination } from './types/update.examination.type';

@Injectable()
export class ExaminationService {
  constructor(
    @InjectRepository(Examination)
    private readonly examinationRepository: Repository<Examination>,

    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,

    @InjectRepository(Practitioner)
    private readonly practitionerRepository: Repository<Practitioner>,

    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,

    @Inject(forwardRef(() => PatientService))
    private readonly patientService: PatientService,
  ) {}

  async findAllExaminations(
    options: IPaginationOptions,
    sortDir: 'ASC' | 'DESC' = 'ASC',
    sortField = 'id',
    filterDto: FilterDto,
  ): Promise<Pagination<Examination>> {
    const examinations = this.examinationRepository
      .createQueryBuilder('examination')
      .leftJoin('examination.serviceType', 'serviceType')
      .leftJoin('examination.patient', 'patient')
      .leftJoin('examination.organization', 'organization')
      .select([
        'examination.id AS id',
        'examination.identifier AS identifier',
        'examination.status AS status',
        'examination.priority AS priority',
        'examination.startDate AS "startDate"',
        'examination.endDate AS "endDate"',
        'CONCAT(patient.name || \' \' || patient.surname) AS "patientName"',
        'serviceType.name AS "serviceType"',
      ])
      .where('examination.status != :status', {
        status: Status.ENTERED_IN_ERROR,
      });

    if (Object.keys(filterDto).length === 0) {
      examinations.andWhere('1=0');
      console.log('inside undefined filterDot');
    }

    if (filterDto.organization) {
      examinations.andWhere('examination.organization_id = :organizationId', {
        organizationId: filterDto.organization,
      });
      console.log(
        'inside filterDto.organization',
        await examinations.getCount(),
      );
    }

    if (filterDto.patient) {
      examinations.andWhere('examination.patient_id = :patientId', {
        patientId: filterDto.patient,
      });
      console.log('inside filterDto.patient');
    }

    if (filterDto.serviceType) {
      examinations.andWhere('examination.service_type_id = :serviceTypeId', {
        serviceTypeId: filterDto.serviceType,
      });
      console.log('inside filterDto.serviceType');
    }

    if (filterDto.status) {
      examinations.andWhere('examination.status = :status', {
        status: filterDto.status,
      });
      console.log('inside filterDto.status', await examinations.getCount());
    }

    if (filterDto.priority) {
      examinations.andWhere('examination.priority = :priority', {
        priority: filterDto.priority,
      });
      console.log('inside filterDto.priority');
    }

    examinations.orderBy(sortField, sortDir);

    return paginateRaw(examinations, options);
  }

  async findExaminationById(id: number): Promise<Examination> {
    const examination = await this.examinationRepository.findOne({
      where: {
        id: id,
      },
      relations: ['organization', 'practitioners', 'patient'],
    });

    if (!examination || examination.status === Status.ENTERED_IN_ERROR) {
      throw new NotFoundException('Examination with given ID not found');
    }

    delete examination.organization.practitioners;
    delete examination.organization.patients;

    return examination;
  }

  async createExamination(
    createExaminationDto: CreateExaminationDto,
  ): Promise<{ message: string }> {
    const {
      organizationId,
      patientId,
      practitionersIds,
      serviceTypeId,
      ...examina
    } = createExaminationDto;

    const examination = this.examinationRepository.create(examina);

    this.isIdentifierInUse(examination);
    examination.practitioners = [];

    const organization = await this.organizationService.findOrganizationById(
      organizationId,
    );

    const serviceType = await this.serviceTypeRepository.findOneBy({
      id: serviceTypeId,
    });

    const patient = await this.patientService.findPatientById(patientId);

    for (const practitionerId of practitionersIds) {
      const practitioner = await this.practitionerRepository.findOne({
        where: {
          id: practitionerId,
        },
      });
      examination.practitioners.push(practitioner);
    }

    examination.organization = organization;
    examination.patient = patient;
    examination.serviceType = serviceType;

    await this.examinationRepository.save(examination);

    return { message: 'Examination saved successfully' };
  }

  async updateExamination(
    id: number,
    newExamination: Partial<UpdateExamination>,
  ): Promise<{ message: string }> {
    const examination = await this.findExaminationById(id);

    if (examination.serviceTypeId != newExamination.serviceTypeId) {
      const serviceType = await this.serviceTypeRepository.findOne({
        where: {
          id: newExamination.serviceTypeId,
        },
      });
      examination.serviceType = serviceType;
    }

    if (examination.organizationId != newExamination.organizationId) {
      const organization =
        await this.organizationService.findOrganizationSimpleById(
          newExamination.organizationId,
        );
      examination.organization = organization;
    }

    const practitionersIds = examination.practitioners.map((practitioner) => {
      return practitioner.id;
    });
    const newPractitioners = [];

    if (practitionersIds != newExamination.practitionersIds) {
      newExamination.practitionersIds.forEach(async (practitioner) => {
        const pract = await this.practitionerRepository.findOneBy({
          id: practitioner,
        });
        return newPractitioners.push(pract);
      });
      examination.practitioners = newPractitioners;
    }

    Object.assign(examination, newExamination);

    this.examinationRepository.save(examination);

    return { message: 'Examination updated successfully' };
  }

  async deleteExaminationById(id: number): Promise<{ message: string }> {
    const examination = await this.findExaminationById(id);

    examination.status = Status.ENTERED_IN_ERROR;

    this.examinationRepository.save(examination);

    return { message: 'Examination successfully deleted' };
  }

  private async isIdentifierInUse(examination) {
    const examinationByIdentifier = await this.examinationRepository.findOneBy({
      identifier: examination.identifier,
    });

    if (examinationByIdentifier) {
      throw new ConflictException(
        'Examination with that identifier or name already exists, please choose another',
      );
    }
  }
}
