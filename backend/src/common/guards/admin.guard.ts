import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../enums/role.enum';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<T extends { role: Role }>(err: Error, user: T): T {
    if (err || !user) throw err || new ForbiddenException();
    if (user.role !== Role.ADMIN) throw new ForbiddenException('관리자만 접근 가능합니다.');
    return user;
  }
}
