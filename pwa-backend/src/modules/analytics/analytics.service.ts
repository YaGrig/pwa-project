import { Injectable } from '@nestjs/common'
import { AnalyticsMonthDTO } from './dto/analytics-month.dto'
import { DatabaseService } from '../../database/database.service'

@Injectable()
export class AnalyticsService {
  constructor(private database: DatabaseService) {}
  async getUserAnalytics(userId: string) {
    const query = `SELECT * FROM user_summary WHERE user_id = $1`
    const result = await this.database.query(query, [userId])
    return result.rows[0]
  }

  async getUserAnalyticsMonth(dto: AnalyticsMonthDTO, userId: string) {
    console.log(dto, 'dto')
    const query = `
    SELECT 
      period_start as month_start,
      period_end as month_end,
      TO_CHAR(period_start, 'YYYY-MM') as year_month,
      EXTRACT(MONTH FROM period_start) as month_number,
      TO_CHAR(period_start, 'Month') as month_name,
      TO_CHAR(period_start, 'DD') as date,
      transactions_count,
      total_expenses,
      total_incomes,
      closing_balance as balance,
      CASE 
        WHEN total_expenses > 0 THEN total_incomes / total_expenses * 100
        ELSE 0 
      END as income_to_expense_ratio,
      updated_at
    FROM user_summary 
    WHERE user_id = $1 
      AND period = 'day'
    AND (
      (period_start >= $2 AND period_end <= $3)    
    )
    ORDER BY period_start ASC
  `

    const result = await this.database.query(query, [
      userId,
      dto.startDate,
      dto.endDate,
    ])

    console.log(result, 'phrek')

    return result.rows
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // async updateAllAnalytics() {
  //   try {
  //     await this.database.query(
  //       `REFRESH MATERIALIZED VIEW CONCURRENTLY user_summary`,
  //     )
  //     console.log('MV updated at', new Date())
  //   } catch (error) {
  //     console.error('Failed to update MV:', error)
  //   }
  // }
}
