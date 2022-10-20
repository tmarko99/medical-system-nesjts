/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  if (!req.user) {
    return null;
  }

  if (data) {
    return req.user[data];
  }

  return req.user;
});
