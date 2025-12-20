import { Module } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { DatabaseModule } from '@/database/database.module'

@Module({
  controllers: [AnalyticsController, DatabaseModule],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
