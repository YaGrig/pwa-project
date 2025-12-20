import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../../modules/auth/auth.service'
import { CustomRequest } from '../types/req.types'

export class jwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(ConfigService) private config: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const req: CustomRequest = context.switchToHttp().getRequest()
    const token = req.cookies.access_token
    const secret = this.config.get<string>('REFRESH_SECRET')

    if (!token) {
      throw new UnauthorizedException('User unauthorized')
    }

    if (!secret) {
      throw new UnauthorizedException('no jwt token')
    }

    try {
      const payload = this.authService.validateToken(token, secret)

      req.user = payload
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error}`)
    }
    return true
  }
}
