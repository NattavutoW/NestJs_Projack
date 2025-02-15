import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User, 'auth') private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({ username, email, password: hashedPassword });
    return this.userRepository.save(newUser);
  }

  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.createAccessToken(user.id, user.username);
    const refreshToken = this.createRefreshToken(user.id, user.username);

    // ✅ Hash Refresh Token ก่อนบันทึก
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken; // Save hashed token
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // ✅ ใช้ bcrypt.compare() เพื่อเปรียบเทียบ refreshToken กับค่าที่เก็บในฐานข้อมูล
      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.createAccessToken(user.id, user.username);
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = '';  // ลบ refresh token จากฐานข้อมูล
      await this.userRepository.save(user);  // อัปเดตในฐานข้อมูล
    }
  }

  private createAccessToken(userId: number, username: string): string {
    return this.jwtService.sign({ username, sub: userId }, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN });
  }

  private createRefreshToken(userId: number, username: string): string {
    return this.jwtService.sign({ username, sub: userId }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  }
}
