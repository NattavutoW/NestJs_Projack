import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable, from, throwError } from 'rxjs';  // เพิ่ม from
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class JwtAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      catchError((error) => {
        if (error.status === 401 && error.message === 'Unauthorized') {
          const refreshToken = request.cookies['refreshToken'];

          if (!refreshToken) {
            return throwError(() => new UnauthorizedException('Refresh Token is missing'));
          }

          return from(this.authService.refreshToken(refreshToken)).pipe(  // แก้ไขจาก promise เป็น Observable
            switchMap(({ accessToken }) => {
              request.headers['authorization'] = `Bearer ${accessToken}`;
              response.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
              });
              return next.handle();
            }),
            catchError(() => throwError(() => new UnauthorizedException('Invalid refresh token')))
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
