import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Đã được set bởi JwtAuthGuard hoặc interceptor

    // Nếu không truyền key -> trả về toàn bộ user
    if (!data) {
      return user;
    }

    // Nếu truyền key (ví dụ 'patient') -> trả về field tương ứng trên user
    // LoadPatientInterceptor đã gắn patient vào request.user.patient
    const key = data as string;
    return user?.[key];
  },
);
