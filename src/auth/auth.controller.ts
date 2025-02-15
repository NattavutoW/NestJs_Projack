import { Controller, Post, Body, Req,Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; email: string; password: string }) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }, @Res() res: Response) {
    const { username, password } = loginDto;
    const { accessToken, refreshToken } = await this.authService.login(username, password);

    // ส่ง cookie พร้อม accessToken และ refreshToken
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true }); // หากใช้ HTTPS
    res.json({ accessToken });
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.headers['x-refresh-token'] as string;
    return this.authService.refreshToken(refreshToken);
  }
  
  @Post('logout')
  async logout(@Res() res: Response) {
    // ลบ cookie ของ refreshToken
    res.clearCookie('refreshToken'); // ลบ cookie ของ refresh token

    // ส่ง response กลับไปว่า logout สำเร็จ
    res.json({ message: 'Successfully logged out' });
  }
}
