import { PatientService } from './../patient/patient.service';
import { Examination, Status } from './../examination/examination.entity';
import { PractitionerService } from './../practitioner/practitioner.service';
import { OrganizationType } from './organization-type.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from './organization.entity';
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
import {
  IPaginationOptions,
  paginate,
  paginateRaw,
  paginateRawAndEntities,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

    @InjectRepository(OrganizationType)
    private readonly organizationTypeRepository: Repository<OrganizationType>,

    @InjectRepository(Examination)
    private readonly examinationRepository: Repository<Examination>,

    @Inject(forwardRef(() => PractitionerService))
    private readonly practitionerService: PractitionerService,

    @Inject(forwardRef(() => PatientService))
    private readonly patientService: PatientService,
  ) {}

  async findAllOrganizations(
    options: IPaginationOptions,
    sortDir: 'ASC' | 'DESC' = 'ASC',
    sortField = 'id',
  ): Promise<Pagination<any>> {
    const organizations = this.organizationRepository
      .createQueryBuilder('o')
      .leftJoin('o.type', 'type')
      .leftJoin('o.practitioners', 'practitioner')
      .leftJoin('o.patients', 'patient')
      .select([
        'o.id AS id',
        'o.identifier AS identifier',
        'o.active AS active',
        'o.name AS name',
        'o.address AS address',
        'o.phone AS phone',
        'o.email AS email',
        'type.name AS type',
        '(SELECT COUNT(p.id) FROM patients p INNER JOIN organizations o ON o.id = p.organization_id WHERE p.active = true)::INTEGER AS "numberOfPatients"',
        '(SELECT COUNT(p.id) FROM practitioners p INNER JOIN organizations o ON o.id = p.organization_id WHERE p.active = true)::INTEGER AS "numberOfPractitioners"',
      ])
      .where('o.active IS true')
      .groupBy('o.id, type.name')
      .orderBy(sortField, sortDir);

    const org = await this.organizationRepository.find({
      where: {
        active: true,
      },
      relations: ['practitioners', 'patients'],
    });

    return paginateRaw(organizations, options);

    const results = await paginate(this.organizationRepository, options);
    console.log(results);

    return new Pagination(
      await Promise.all(
        results.items.map(async (item) => {
          const numberOfPractitioners = item.practitioners.filter(
            (practitioner) => practitioner.active === true,
          ).length;
          const numberOfPatients = item.patients.filter(
            (patient) => patient.active === true,
          ).length;
          const organizationType = item.type.name;

          delete item.practitioners;
          delete item.patients;
          delete item.type;
          delete item.typeId;

          return {
            ...item,
            numberOfPractitioners: numberOfPractitioners,
            numberOfPatients: numberOfPatients,
            organizationType: organizationType,
          };
        }),
      ),
      results.meta,
      results.links,
    );
  }

  async findOrganizationSimpleById(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization with given ID not found');
    }

    return organization;
  }

  async findOrganizationById(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: {
        id: id,
      },
      relations: ['type', 'practitioners', 'patients'],
    });

    if (!organization) {
      throw new NotFoundException('Organization with given ID not found');
    }

    organization.practitioners.forEach(
      (practitioner) => delete practitioner.organization,
    );

    return organization;
  }

  async createOrganization(
    organizationDto: CreateOrganizationDto,
  ): Promise<{ message: string }> {
    const { type, ...other } = organizationDto;
    const organization = this.organizationRepository.create(other);

    this.isIdentifierOrNameInUse(organization);

    const organizationType = await this.organizationTypeRepository.findOneBy({
      id: type,
    });

    if (!organizationType) {
      throw new NotFoundException('Organization type with given ID not found');
    }

    organization.type = organizationType;

    await this.organizationRepository.save(organization);

    return { message: 'Organization Created Successfully' };
  }

  async updateOrganizationById(
    id: number,
    newOrganization: Partial<CreateOrganizationDto>,
  ): Promise<{ message: string }> {
    const organization = await this.findOrganizationById(id);

    if (organization.type.id !== newOrganization.type) {
      const organizationType = await this.organizationTypeRepository.findOneBy({
        id: organization.type.id,
      });
      organization.type = organizationType;
    }

    if (organization.identifier !== newOrganization.identifier) {
      this.isIdentifierOrNameInUse(organization);
    }

    Object.assign(organization, newOrganization);

    this.organizationRepository.save(organization);

    return { message: 'Organization updated successfully' };
  }

  async deleteOrganizationById(id: number): Promise<{ message: string }> {
    const organization = await this.findOrganizationById(id);
    const examinationsPerformedByOrganization =
      await this.examinationRepository.find({
        where: {
          organization: organization,
        },
      });

    const examinationsInRunningState =
      examinationsPerformedByOrganization.filter((examination) => {
        return examination.status === Status.IN_PROGRESS;
      }).length;

    if (examinationsInRunningState > 0) {
      throw new BadRequestException(
        'Cannot delete organization because there are examinations in the RUNNING state',
      );
    }

    organization.practitioners.forEach((practitioner) => {
      this.practitionerService.setUnassigned(practitioner.id);
      this.practitionerService.deletePractitionerById(practitioner.id);
    });

    organization.patients.forEach((patient) => {
      this.patientService.deletePatientById(patient.id);
    });

    organization.active = false;

    this.organizationRepository.save(organization);

    return { message: 'Organization deleted successfully' };
  }

  private async isIdentifierOrNameInUse(organization) {
    const organizationByIdentifier =
      await this.organizationRepository.findOneBy({
        identifier: organization.identifier,
      });

    const organizationByName = await this.organizationRepository.findOneBy({
      name: organization.name,
    });

    if (organizationByIdentifier || organizationByName) {
      throw new ConflictException(
        'Organization with that identifier or name already exists, please choose another',
      );
    }
  }
}
