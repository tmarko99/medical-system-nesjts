import { PatientService } from 'src/patient/patient.service';
import { OrganizationService } from './../organization/organization.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { Practitioner } from './practitioner.entity';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from 'src/organization/organization.entity';
import {
  IPaginationOptions,
  paginateRaw,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Status } from 'src/examination/examination.entity';

@Injectable()
export class PractitionerService {
  constructor(
    @InjectRepository(Practitioner)
    private readonly practitionerRepository: Repository<Practitioner>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,

    @Inject(forwardRef(() => PatientService))
    private readonly patientService: PatientService,
  ) {}

  async findAllPractitioners(
    options: IPaginationOptions,
    sortDir: 'ASC' | 'DESC' = 'ASC',
    sortField = 'id',
  ): Promise<Pagination<any>> {
    const practitioners = this.practitionerRepository
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
        'p.qualification AS qualification',
        'o.name AS "organizationName"',
      ])
      .where('p.active IS true')
      .orderBy(sortField, sortDir);

    return paginateRaw<any>(practitioners, options);
  }

  async createPractitioner(
    practitionerDto: CreatePractitionerDto,
  ): Promise<{ message: string }> {
    const { organizationId, ...pract } = practitionerDto;
    const practitioner = this.practitionerRepository.create(pract);

    this.isIdentifierInUse(practitioner);

    const organization = await this.organizationRepository.findOneBy({
      id: organizationId,
    });

    if (!organization) {
      throw new NotFoundException('Organization with given ID not found');
    }

    practitioner.organization = organization;

    await this.practitionerRepository.save(practitioner);

    return { message: 'Practitioner Created Successfully' };
  }

  async findPractitionerById(id: number): Promise<Practitioner> {
    const practitioner = await this.practitionerRepository.findOne({
      where: {
        id: id,
      },
      relations: ['organization', 'examinations'],
    });

    if (!practitioner) {
      throw new NotFoundException('Practitioner with given ID not found');
    }

    delete practitioner.organizationId;
    delete practitioner.organization.typeId;
    delete practitioner.organization.patients;
    delete practitioner.organization.practitioners;

    return practitioner;
  }

  async updatePractitionerById(
    id: number,
    newPractitioner: Partial<CreatePractitionerDto>,
  ): Promise<{ message: string }> {
    const practitioner = await this.findPractitionerById(id);

    if (practitioner.organizationId != newPractitioner.organizationId) {
      const organization = await this.organizationService.findOrganizationById(
        newPractitioner.organizationId,
      );
      practitioner.organization = organization;
    }

    if (practitioner.identifier !== newPractitioner.identifier) {
      this.isIdentifierInUse(newPractitioner);
    }
    Object.assign(practitioner, newPractitioner);

    this.practitionerRepository.save(practitioner);

    return { message: 'Practitioner updated successfully' };
  }

  async deletePractitionerById(id: number): Promise<{ message: string }> {
    const practitioner = await this.findPractitionerById(id);

    const examinationsInRunningState = practitioner.examinations.filter(
      (examination) => {
        return examination.status === Status.IN_PROGRESS;
      },
    ).length;

    if (examinationsInRunningState > 0) {
      throw new BadRequestException(
        'Cannot delete practitioner because there are examinations in the RUNNING state by this practitioner',
      );
    }

    practitioner.patients.forEach((patient) => {
      return this.patientService.setUnassigned(patient.id);
    });

    practitioner.active = false;

    this.practitionerRepository.save(practitioner);

    return { message: 'Practitioner successfully deleted' };
  }

  async setUnassigned(id: number) {
    const practitioner = await this.findPractitionerById(id);

    practitioner.organization = null;

    this.practitionerRepository.save(practitioner);
  }

  private async isIdentifierInUse(practitioner) {
    const practitionerByIdentifier =
      await this.practitionerRepository.findOneBy({
        identifier: practitioner.identifier,
      });

    if (practitionerByIdentifier) {
      throw new ConflictException(
        'Practitioner with that identifier already exists, please choose another',
      );
    }
  }
}
