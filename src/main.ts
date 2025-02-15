import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthInterceptor } from './interceptors/jwt-auth.interceptor';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ใช้งาน Interceptor
  const authService = app.get(AuthService);
  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new JwtAuthInterceptor(authService, jwtService, reflector));

  await app.listen(3000);
}
bootstrap();
