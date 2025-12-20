import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@/database/database.service'

@Injectable()
export class AnalyticsService {
  constructor(private readonly database: DatabaseService) {}

  async getUserAnalytics(userId: string) {
    return await this.database.query(
      'SELECT * FROM user_summary WHERE user_id=$1',
      [userId],
    )
  }
}
