import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthService } from 'src/modules/auth/auth.service'

export class jwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(ConfigService) private config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest()
    const token = req.cookies.access_token
    const secret = this.config.get<string>('REFRESH_SECRET')

    if (!token) {
      throw new UnauthorizedException('User unauthorized')
    }

    if (!secret) {
      throw new UnauthorizedException('no jwt token')
    }

    try {
      const payload = await this.authService.validateToken(token, secret)

      req.user = payload
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
    return true
  }
}
