import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './role.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  FindUserOptions,
  FindUserParams,
} from 'src/shared/utils/types/queries';
import { getUserSelectors } from 'src/shared/utils/constants';
import { AuthResponse } from './dto/auth-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,

    private jwtService: JwtService,
  ) {}

  async findUser(
    params: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User> {
    const select = getUserSelectors(options?.selectPassword);
    return await this.userRepository.findOne({
      where: params,
      select,
      relations: ['roles'],
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { firstName, lastName, email, password, role } = createUserDto;

    const userByEmail = await this.userRepository.findOneBy({
      email: email,
    });

    const userRole = await this.roleRepository.findOneBy({
      name: role,
    });

    if (!userRole) {
      throw new BadRequestException('Given role does not exist.');
    }

    if (userByEmail) {
      throw new ConflictException('Email are already taken');
    }

    const user = new User();
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.firstName = firstName;
    user.lastName = lastName;
    user.roles = [userRole];

    await this.userRepository.save(user);

    return { message: 'User created successfully' };
  }

  async validateUser(authCredentialsDto: AuthCredentialsDto) {
    const user = await this.findUser(
      { email: authCredentialsDto.email },
      { selectPassword: true },
    );

    const isPasswordValid = await bcrypt.compare(
      authCredentialsDto.password,
      user.password,
    );

    if (user && isPasswordValid) {
      return { ...user };
    }

    return null;
  }

  async loginUser(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<AuthResponse> {
    const user = await this.validateUser(authCredentialsDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.sign(user);

    return new AuthResponse(user.email, accessToken);
  }
}
