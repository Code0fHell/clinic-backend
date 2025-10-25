import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 🔹 Trường hợp chưa có token hoặc token lỗi
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // 🔹 Kiểm tra quyền
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied for role ${user.role}. Required: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
