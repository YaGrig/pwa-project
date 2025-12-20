import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import type { CustomRequest } from '@/common/types/req.types'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('get')
  getUserAnalytics(@Req() req: CustomRequest) {
    return this.analyticsService.getUserAnalytics(req.user)
  }
}
