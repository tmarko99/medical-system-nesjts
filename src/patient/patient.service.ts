import {
  IPaginationOptions,
  paginateRaw,
  Pagination,
} from 'nestjs-typeorm-paginate';
import {
  QualificationType,
  Practitioner,
} from './../practitioner/practitioner.entity';
import { PractitionerService } from './../practitioner/practitioner.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from 'src/patient/patient.entity';
import {
  HttpException,
  Injectable,
  HttpStatus,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationService } from 'src/organization/organization.service';
import { Status } from 'src/examination/examination.entity';
import * as moment from 'moment';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @Inject(forwardRef(() => PractitionerService))
    private readonly practitionerService: PractitionerService,

    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
  ) {}

  async findAllPatients(
    options: IPaginationOptions,
    sortDir: 'ASC' | 'DESC' = 'ASC',
    sortField = 'id',
  ): Promise<Pagination<Patient>> {
    const patients = this.patientRepository
      .createQueryBuilder('p')
      .leftJoin('p.organization', 'o')
      .select([
        'p.id AS id',
        'p.identifier AS identifier',
        'p.active AS active',
        'p.name AS name',
        'p.surname AS surname',
        'p.gender AS gender',
        'p.birthDate AS "bithDate"',
        'p.address AS address',
        'p.phone AS phone',
        'p.email AS email',
        'p.maritalStatus AS "maritalStatus"',
        'p.deceased AS deceased',
        'o.name AS "organizationName"',
      ])
      .where('p.active IS true')
      .orderBy(sortField, sortDir);

    return paginateRaw<Patient>(patients, options);
  }

  async findPatientById(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: {
        id: id,
      },
      relations: ['organization', 'practitioner', 'examinations'],
    });

    if (!patient) {
      throw new NotFoundException('Patient with given ID not found');
    }

    delete patient.organization.practitioners;
    delete patient.organization.patients;
    delete patient.organizationId;
    delete patient.practitionerId;

    return patient;
  }

  async createPatient(
    createPatientDto: CreatePatientDto,
  ): Promise<{ message: string }> {
    const { practitionerId, organizationId, ...p } = createPatientDto;

    const organization = await this.organizationService.findOrganizationById(
      organizationId,
    );

    const practitioner = await this.practitionerService.findPractitionerById(
      practitionerId,
    );

    this.checkPractitionerQualification(practitioner);

    const patient = this.patientRepository.create(p);

    this.isIdentifierInUse(patient);

    patient.organization = organization;
    patient.practitioner = practitioner;

    this.patientRepository.save(patient);

    return { message: 'Patient saved successfully' };
  }

  async updatePatientById(
    id: number,
    newPatient: Partial<CreatePatientDto>,
  ): Promise<{ message: string }> {
    const patient = await this.findPatientById(id);

    if (patient.organizationId != newPatient.organizationId) {
      const organization = await this.organizationService.findOrganizationById(
        newPatient.organizationId,
      );
      patient.organization = organization;
    }

    if (patient.practitionerId != newPatient.practitionerId) {
      const practitioner = await this.practitionerService.findPractitionerById(
        newPatient.organizationId,
      );
      this.checkPractitionerQualification(practitioner);

      patient.practitioner = practitioner;
    }

    Object.assign(patient, newPatient);

    this.patientRepository.save(patient);

    return { message: 'Patient updated successfully' };
  }

  async deletePatientById(id: number): Promise<{ message: string }> {
    const patient = await this.findPatientById(id);

    const examinationsInRunningState = patient.examinations.filter(
      (examination) => {
        return examination.status === Status.IN_PROGRESS;
      },
    ).length;

    if (examinationsInRunningState > 0) {
      throw new BadRequestException(
        'Cannot delete patient because there are examinations in the RUNNING state',
      );
    }

    const currentDate = moment(new Date()).format('yyyy-MM-DD HH:mm:ss');

    if (
      patient.examinations.filter(
        (examination) =>
          moment(examination.startDate).format('yyyy-MM-DD HH:mm:ss') <
          currentDate,
      ).length > 0 &&
      patient.examinations.filter(
        (examination) =>
          moment(examination.endDate).format('yyyy-MM-DD HH:mm:ss') >
          currentDate,
      ).length > 0
    ) {
      throw new BadRequestException(
        'You cannot delete a patient because there are examinations in executing phase',
      );
    }

    patient.active = false;

    this.patientRepository.save(patient);

    return { message: 'Patient successfully deleted' };
  }

  async setUnassigned(id: number) {
    const patient = await this.findPatientById(id);

    patient.practitioner = null;

    this.patientRepository.save(patient);
  }

  private checkPractitionerQualification(practitioner: Practitioner) {
    if (practitioner.qualification !== QualificationType.DOCTOR_OF_MEDICINE) {
      throw new HttpException(
        'Primary care provider must have title Doctor of Medicine',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async isIdentifierInUse(patient) {
    const patientByIdentifier = await this.patientRepository.findOneBy({
      identifier: patient.identifier,
    });

    if (patientByIdentifier) {
      throw new ConflictException(
        'Patient with that identifier already exists, please choose another',
      );
    }
  }
}
