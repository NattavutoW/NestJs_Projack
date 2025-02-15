import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // ข้อมูลที่ต้องการบันทึก
    const logMessage = `URL: ${req.originalUrl} | HTTP Method: ${req.method}`;

    // กำหนด output stream ไว้ในไฟล์ log
    const logFilePath = path.join(__dirname, '../../../logs/api-logs.txt');

    // เมื่อ Response ส่งกลับเสร็จ เราจะคำนวณ Response Time
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const logDetails = `${logMessage} | Response Time: ${responseTime}ms\n`;

      // เขียนข้อมูลลงในไฟล์
      fs.appendFileSync(logFilePath, logDetails);
    });

    next();
  }
}
