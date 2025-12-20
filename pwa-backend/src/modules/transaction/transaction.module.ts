import { Module } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { TransactionController } from './transaction.controller'
import { DatabaseModule } from '@/database/database.module'
// import { NotificationGateway } from '@/websocket/websocket.service'

@Module({
  imports: [DatabaseModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
