import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRootMultiple(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }), // โหลดค่าจาก .env
        ...DatabaseModule.loadDatabaseConnections(),
      ],
      exports: [TypeOrmModule],
    };
  }

  private static loadDatabaseConnections(): DynamicModule[] {
    const dbCount = parseInt(process.env.DB_COUNT || '1', 10); // กำหนดค่า default เป็น 1
    const connections: DynamicModule[] = [];

    for (let i = 1; i <= dbCount; i++) {
      connections.push(
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name: process.env[`DB${i}_NAME`] || `db${i}`, // ตั้งค่าเริ่มต้นเป็น "db1", "db2" ถ้าไม่กำหนด
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get<string>(`DB${i}_HOST`, 'localhost'), // กำหนดค่าเริ่มต้น
            port: configService.get<number>(`DB${i}_PORT`, 3306),
            username: configService.get<string>(`DB${i}_USER`, 'root'),
            password: configService.get<string>(`DB${i}_PASS`, 'password'),
            database: configService.get<string>(`DB${i}_NAME`, `db${i}`),
            autoLoadEntities: true,
            synchronize: true, // ใช้เฉพาะตอนพัฒนา
          }),
        }),
      );
    }

    return connections;
  }
}
