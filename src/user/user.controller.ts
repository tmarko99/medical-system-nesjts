import { AuthResponse } from './dto/auth-response.dto';
import { UserService } from './user.service';
import { Body, Controller, Post } from '@nestjs/common';
import { BackendValidationPipe } from 'src/shared/pipes/backend-validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Public } from './decorators/public.decorator';

@Controller('user')
@Public()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  createUser(
    @Body(BackendValidationPipe) createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    const user = this.userService.createUser(createUserDto);

    return user;
  }

  @Post('/login')
  loginUser(
    @Body(BackendValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<AuthResponse> {
    return this.userService.loginUser(authCredentialsDto);
  }
}
