import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';

@Injectable()
@Processor('emailQueue')
export class EmailProcessor {
  @Process()
  async sendEmail(job: Job) {
    const { email, subject, body } = job.data;
    console.log(`Sending email to ${email} with subject: ${subject}`);

    // ฟังก์ชันส่ง Email ที่สามารถใช้ได้ (สามารถใช้ Email service จริง ๆ เช่น nodemailer)
    // await emailService.sendMail({ to: email, subject, text: body });

    return `Email sent to ${email}`;
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log(`Job completed with result: ${job.returnvalue}`);
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    console.log(`Job failed with error: ${job.failedReason}`);
  }
}
