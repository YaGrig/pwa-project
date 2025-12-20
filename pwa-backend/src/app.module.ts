import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
// import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config'
import { LoggerMiddleware } from './common/middlewares/logger-middleware'
import { TransactionModule } from './modules/transaction/transaction.module'
import { DatabaseModule } from './database/database.module'
import { NotificationModule } from './websocket/websocket.module'
import { IncomeModule } from './modules/income/income.module'

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    TransactionModule,
    // AppCacheModule,
    IncomeModule,
    NotificationModule,
    // PrismaModule,
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
