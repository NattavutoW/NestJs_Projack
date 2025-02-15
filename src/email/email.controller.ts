import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EmailService } from './email.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @InjectQueue('emailQueue') private emailQueue: Queue
  ) {}

  // Endpoint สำหรับเพิ่มงานส่ง Email เข้า Queue
  @Post('send')
  async sendEmail(
    @Body('email') email: string,
    @Body('subject') subject: string,
    @Body('body') body: string
  ) {
    await this.emailService.addToQueue(email, subject, body);
    return { message: 'Email job added to the queue' };
  }

  // Endpoint สำหรับตรวจสอบสถานะของงาน
  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) {
      return { message: 'Job not found' };
    }
    return { status: await job.getState(), result: job.returnvalue };
  }
}
