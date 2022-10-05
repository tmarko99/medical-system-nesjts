import { OrganizationResponse } from './dto/organization-response';
import { OrganizationType } from './organization-type.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from './organization.entity';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginateRaw,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

    @InjectRepository(OrganizationType)
    private readonly organizationTypeRepository: Repository<OrganizationType>,
  ) {}

  async findAll(
    options: IPaginationOptions,
    sortDir: 'ASC' | 'DESC' = 'ASC',
    sortField = 'id',
  ): Promise<Pagination<OrganizationResponse>> {
    const organizations = this.organizationRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.type', 'type')
      .select([
        'o.id AS id',
        'o.identifier AS identifier',
        'o.active AS active',
        'o.name AS name',
        'o.address AS address',
        'o.phone AS phone',
        'o.email AS email',
        'type.name AS type',
      ])
      .where('o.active IS true')
      .orderBy(sortField, sortDir);

    return paginateRaw<OrganizationResponse>(organizations, options);
  }

  async findOrganizationById(id: number): Promise<OrganizationResponse> {
    const organization = this.organizationRepository
      .createQueryBuilder('o')
      .leftJoin('o.type', 'type')
      .select([
        'o.id AS id',
        'o.identifier AS identifier',
        'o.active AS active',
        'o.name AS name',
        'o.address AS address',
        'o.phone AS phone',
        'o.email AS email',
        'type AS type',
      ])
      .where('o.id = :orgId', { orgId: id })
      .andWhere('o.active IS true');

    const count = await organization.getCount();

    if (count == 0) {
      throw new NotFoundException('Organization with given ID not found');
    }

    return organization.getRawOne();
  }

  async createOrganization(
    organizationDto: CreateOrganizationDto,
  ): Promise<{ message: string }> {
    const { type, ...other } = organizationDto;
    const organization = this.organizationRepository.create(other);

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

  async updateOrganization(
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

    Object.assign(organization, newOrganization);

    this.organizationRepository.save(organization);

    return { message: 'Organization updated successfully' };
  }

  async deleteOrganization(id: number): Promise<{ message: string }> {
    const organization = await this.findOrganizationById(id);

    organization.active = false;

    this.organizationRepository.save(organization);

    return { message: 'Organization deleted successfully' };
  }
}
