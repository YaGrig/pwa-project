import { Module } from '@nestjs/common'
import { IncomeService } from './income.service'
import { IncomeController } from './income.controller'
import { DatabaseModule } from '@/database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
