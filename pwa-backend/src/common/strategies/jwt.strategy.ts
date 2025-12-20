import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { AuthService } from '../../modules/auth/auth.service'
// import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string
  iat?: number
  exp?: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    // private prisma: PrismaService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET')
    console.log(secret, process.env.JWT_ACCESS_SECRET, 'saeraweojraweporj')
    if (!secret) {
      throw new Error('JWT_TOKEN is not defined in environment variables')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtPayload) {
    const user = await this.authService.findOne(payload.sub)

    if (!user) {
      throw new UnauthorizedException('User not found or inactive')
    }
    return user.id
  }
}
