import { OrganizationService } from './../organization/organization.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { Practitioner } from './practitioner.entity';
import {
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

@Injectable()
export class PractitionerService {
  constructor(
    @InjectRepository(Practitioner)
    private readonly practitionerRepository: Repository<Practitioner>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
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

    const practitionerByIdentifier =
      await this.practitionerRepository.findOneBy({
        identifier: practitioner.identifier,
      });

    if (practitionerByIdentifier) {
      throw new ConflictException(
        'Practitioner with that identifier already exists, please choose another',
      );
    }

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
      relations: ['organization'],
    });

    if (!practitioner) {
      throw new NotFoundException('Practitioner with given ID not found');
    }

    delete practitioner.organizationId;
    delete practitioner.organization.typeId;

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
    Object.assign(practitioner, newPractitioner);

    this.practitionerRepository.save(practitioner);

    return { message: 'Practitioner updated successfully' };
  }

  async deletePractitionerById(id: number): Promise<{ message: string }> {
    const practitioner = await this.findPractitionerById(id);

    practitioner.active = false;

    this.practitionerRepository.save(practitioner);

    return { message: 'Practitioner successfully deleted' };
  }
}
