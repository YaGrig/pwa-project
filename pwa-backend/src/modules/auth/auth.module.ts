import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '../../common/strategies/jwt.strategy'
import { DatabaseModule } from '../../database/database.module'
import { NotificationModule } from '@/websocket/websocket.module'

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    NotificationModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '30min' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // exports: [PassportModule],
})
export class AuthModule {}
