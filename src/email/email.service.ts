import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('emailQueue') private emailQueue: Queue) {}

  async addToQueue(email: string, subject: string, body: string) {
    await this.emailQueue.add({
      email,
      subject,
      body,
    });
  }
}
