/* eslint-disable prettier/prettier */
import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  PipeTransform,
  ValidationError,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length === 0) {
      return value;
    }

    throw new HttpException(
      this.formatErrors(errors),
      HttpStatus.BAD_REQUEST,
    );
  }

  formatErrors(errors: ValidationError[]) {
    const err = errors.reduce((acc, error) => {
      acc[error.property] = Object.values(error.constraints);
      return acc;
    }, {});
    const timestamp = Date.now();
    const status = HttpStatus.BAD_REQUEST;

    return { errors: err, timestamp: timestamp, status: status }
  }
}
