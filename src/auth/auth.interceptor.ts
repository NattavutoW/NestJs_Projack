import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(async (error) => {
        if (error.status === 401) {
          const request = context.switchToHttp().getRequest();
          const refreshToken = request.headers['x-refresh-token'];
          if (!refreshToken) return throwError(() => new UnauthorizedException('Unauthorized'));

          try {
            const { accessToken } = await this.authService.refreshToken(refreshToken);
            request.headers['authorization'] = `Bearer ${accessToken}`;
            return next.handle();
          } catch {
            return throwError(() => new UnauthorizedException('Unauthorized'));
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
