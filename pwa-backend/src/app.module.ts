import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
// import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerMiddleware } from './common/middlewares/logger-middleware'
import { TransactionModule } from './modules/transaction/transaction.module'
import { DatabaseModule } from './database/database.module'
import { NotificationModule } from './websocket/websocket.module'
import { IncomeModule } from './modules/income/income.module'
import { CacheModule } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-redis-store'
import { ScheduleModule } from '@nestjs/schedule'
import { AnalyticsModule } from './modules/analytics/analytics.module'

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    TransactionModule,
    // AppCacheModule,
    AnalyticsModule,
    IncomeModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    // PrismaModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT') || '6379'),
          },
          ttl: parseInt(configService.get('CACHE_TTL') || '5000'),
          max: 100,
        })

        return {
          store: () => store,
          max: 100,
          ttl: parseInt(configService.get('CACHE_TTL') || '5000'),
        }
      },
      isGlobal: true,
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
