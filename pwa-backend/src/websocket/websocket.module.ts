import { Module } from '@nestjs/common'
import { NotificationGateway } from './websocket.service'

@Module({
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
