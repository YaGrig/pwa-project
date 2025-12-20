import {
  Controller,
  Post,
  Body,
  // UsePipes,
  Res,
  Get,
  // UseGuards,
  Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { type CreateUserDto } from './dto/create-auth.dto'
// import { ZodValidationPipe } from '@/common/pipes/zod.pipe'
import type { Response } from 'express'
// import { jwtAuthGuard } from '../../common/guards/jwt.guard'
import type { CustomRequest } from '../../common/types/req.types'
// import { AuthGuard } from '@nestjs/passport'
import { type LoginAuthDto } from './dto/login-auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async register(
    @Body() createAuthDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.authService.register(createAuthDto)

    response.cookie('access_token', res.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false для localhost
      sameSite: 'lax', // или 'none' для cross-site
      maxAge: 15 * 60 * 1000,
      // domain: 'localhost', // явно укажите домен для разработки
      // path: '/', //
    })

    return {
      jwt_token: res.jwt_token,
      email: res.email,
      name: res.name,
    }
  }

  @Post('register')
  // @UsePipes(new ZodValidationPipe(LoginAuthSchema))
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.authService.login(loginAuthDto)

    response.cookie('access_token', res.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      // domain: 'localhost',
      // path: '/', //
    })

    return {
      jwt_token: res.jwt_token,
      email: res.email,
      name: res.name,
    }
  }
  @Get('me')
  // @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: CustomRequest) {
    return await this.authService.findOne(req.user)
  }

  @Get('refresh')
  // @UseGuards(jwtAuthGuard)
  refresh(@Req() req: CustomRequest) {
    return this.authService.refreshTokens(req.user)
  }

  // @Post()
  // login(@Body() loginAuthDto: LoginAuthDto) {
  //   return this.authService.login(loginAuthDto);
  // }

  @Get('all')
  getAllUsers() {
    return this.authService.findAll()
  }

  @Get('logout')
  // @UseGuards(jwtAuthGuard)
  async logout(
    @Req() req: CustomRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(req.user)
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false для localhost
      sameSite: 'lax', // или 'none' для cross-site
      maxAge: 15 * 60 * 1000,
      // domain: 'localhost', // явно укажите домен для разработки
      // path: '/', //
    })
  }
}
