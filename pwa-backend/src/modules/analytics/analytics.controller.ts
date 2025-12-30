import {
  Controller,
  Get,
  UseGuards,
  Req,
  Body,
  UsePipes,
  Post,
} from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AuthGuard } from '@nestjs/passport'
import type { CustomRequest } from '@/common/types/req.types'
import {
  type AnalyticsMonthDTO,
  AnalyticsMonthSchema,
} from './dto/analytics-month.dto'
import { ZodValidationPipe } from '../../common/pipes/zod.pipe'

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('all')
  async getUserAnalytics(@Req() req: CustomRequest) {
    return await this.analyticsService.getUserAnalytics(req.user)
  }

  @Post('month')
  @UsePipes(new ZodValidationPipe(AnalyticsMonthSchema))
  async getUserAnalyticsMonth(
    @Body() dto: AnalyticsMonthDTO,
    @Req() req: CustomRequest,
  ) {
    return await this.analyticsService.getUserAnalyticsMonth(dto, req.user)
  }
}
