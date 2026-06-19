import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof UserContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;
    return data ? user?.[data] : user;
  },
);
