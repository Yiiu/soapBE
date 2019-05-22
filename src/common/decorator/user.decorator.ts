import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator((_, req: Request) => {
  return req.user;
});
