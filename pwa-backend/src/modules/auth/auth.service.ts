import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { DatabaseService } from '../../database/database.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { JwtPayload, User } from './user.type'
// import { NotificationGateway } from '@/websocket/websocket.service'
import { LoginAuthDto } from './dto/login-auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private database: DatabaseService,
    private jwtService: JwtService,
    private config: ConfigService,
    // private notification: NotificationGateway,
  ) {}
  async register(dto: CreateUserDto) {
    const user_in_db = (await this.findOneByEmail(dto.email)).rows[0]

    if (user_in_db) {
      throw new HttpException('User exists', HttpStatus.FORBIDDEN)
    }

    const password = await bcrypt.hash(dto.password, 10)

    const user = await this.database.query<User>(
      `INSERT INTO users (username, email, hashed_password, user_role) VALUES 
      ($1, $2, $3, $4) RETURNING *`,
      [dto.name, dto.email, password, dto.role],
    )

    const user_id = user.rows[0].id

    const jwt_token = this.generateJwtToken(user_id)
    const refresh_token = this.generateRefreshToken(user_id)

    await this.update(+user_id, { refresh_token })

    return {
      jwt_token,
      refresh_token,
      name: user.rows[0].username,
      email: user.rows[0].email,
    }
  }

  async login(dto: LoginAuthDto) {
    const user_in_db = (await this.findOneByEmail(dto.email)).rows[0]

    if (!user_in_db) {
      throw new HttpException('User doesnt exists', HttpStatus.FORBIDDEN)
    }

    const isPasswordCorrect = await bcrypt.compare(
      dto.password,
      user_in_db.hashed_password,
    )

    if (!isPasswordCorrect) {
      throw new HttpException('Password is incorrect', HttpStatus.FORBIDDEN)
    }

    const jwt_token = this.generateJwtToken(user_in_db.id)
    const refresh_token = this.generateRefreshToken(user_in_db.id)

    console.log(user_in_db, 'idnd')

    await this.update(+user_in_db.id, { refresh_token })

    return {
      jwt_token,
      refresh_token,
      name: user_in_db.username,
      email: user_in_db.email,
    }
  }

  async findAll() {
    const users = (await this.database.query('SELECT * FROM users')).rows
    return users
  }

  async findOne(id: string) {
    const user = await this.database.query<User>(
      `SELECT id, username, email, user_role FROM users WHERE id=$1`,
      [id],
    )
    return user.rows[0]
  }

  async findOneByEmail(email: string) {
    try {
      const result = await this.database.query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email],
      )
      return result
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('An error occurred:', error.message)
      }
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async update(id: number, dto: UpdateAuthDto) {
    const entries = Object.entries(dto)
    const values = Object.values(dto)

    const updates = entries
      .map((item, index) => `${item[0]}=$${index + 1}`)
      .join(',')

    await this.database.query(
      `UPDATE users SET ${updates} WHERE id=$${entries.length + 1}`,
      [...values, id],
    )
  }

  async logout(user_id: string) {
    await this.database.query(`UPDATE users SET refresh_token='' WHERE id=$1`, [
      user_id,
    ])
  }

  generateJwtToken(user_id: string) {
    const payload = {
      sub: user_id,
    }

    const token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: 15 * 60 * 1000,
    })

    return token
  }
  generateRefreshToken(user_id: string) {
    const payload = {
      sub: user_id,
    }

    const token = this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_SECRET'),
      expiresIn: '30d',
    })

    return token
  }

  async refreshTokens(user_id: string) {
    const jwt_token = this.generateJwtToken(user_id)
    const refresh_token = this.generateRefreshToken(user_id)

    await this.update(+user_id, { refresh_token })

    return {
      jwt_token,
    }
  }

  validateToken(token: string, secret: string) {
    try {
      const a = this.jwtService.verify<JwtPayload>(token, {
        secret,
      })
      return a.sub
    } catch (error) {
      console.error('Token verification failed:', error)
      throw error
    }
  }
}
