import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { CreateUserDto } from './dto/create-auth.dto'
import { DatabaseService } from '../../database/database.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { HttpException, HttpStatus } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { email } from 'zod'

// Мок для bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn().mockReturnValue(true),
}))

describe('AuthService', () => {
  let authService: AuthService

  const mockCreateUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    refresh_token: 'existing_token',
    role: 'User',
  }

  const mockExistingUser = {
    rows: [
      {
        id: 1,
        username: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        refresh_token: 'existing_token',
        role: 'User',
      },
    ],
  }

  const mockEmptyUser = {
    rows: [],
  }

  const mockNewUser = {
    rows: [
      {
        id: 1,
        username: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        refresh_token: 'new_refresh_token',
        role: 'User',
      },
    ],
  }

  // Моки сервисов
  const mockDatabaseService = {
    query: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      }
      return config[key] as string
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should throw HttpException if user already exists', async () => {
      // Arrange
      mockDatabaseService.query.mockResolvedValue(mockExistingUser)

      // Act & Assert
      await expect(authService.register(mockCreateUserDto)).rejects.toThrow(
        new HttpException('User exists', HttpStatus.FORBIDDEN),
      )

      // Проверяем что был вызван запрос на проверку пользователя
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email ='),
        [mockCreateUserDto.email],
      )
    })

    it('should successfully register new user', async () => {
      // Arrange
      mockDatabaseService.query
        .mockResolvedValueOnce(mockEmptyUser) // Первый вызов - пользователь не найден
        .mockResolvedValueOnce(mockNewUser)
        .mockResolvedValueOnce({ rows: [] })

      // Мок для JWT токенов
      mockJwtService.sign
        .mockReturnValueOnce('jwt_token') // access token
        .mockReturnValueOnce('refresh_token') // refresh token

      // Act
      const result = await authService.register(mockCreateUserDto)

      // Assert
      expect(result).toEqual({
        email: mockNewUser.rows[0].email,
        name: mockNewUser.rows[0].username,
        jwt_token: 'jwt_token',
        refresh_token: 'refresh_token',
      })

      // Проверяем вызовы базы данных
      expect(mockDatabaseService.query).toHaveBeenCalledTimes(3)

      // Первый вызов - проверка существования пользователя
      expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('SELECT * FROM users WHERE email ='),
        [mockCreateUserDto.email],
      )

      // Второй вызов - создание пользователя
      expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          mockCreateUserDto.name,
          mockCreateUserDto.email,
          'User',
        ]),
      )

      expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
        3,
        'UPDATE users SET refresh_token=$1 WHERE id=$2',
        [
          'refresh_token', // новый refresh token
          1, // ID пользователя
        ],
      )

      // Проверяем хеширование пароля
      expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10)

      // Проверяем создание JWT токенов
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2)
    })

    it('should handle database errors during registration', async () => {
      // Arrange
      mockDatabaseService.query.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(authService.register(mockCreateUserDto)).rejects.toThrow(
        'Database error',
      )
    })
  })

  describe('findOneByEmail', () => {
    // it('should return user if found', async () => {
    //   // Arrange
    //   const email = 'john@example.com'
    //   mockDatabaseService.query.mockResolvedValue(mockExistingUser)
    //   // Act
    //   const result = await authService.findOneByEmail(email)
    //   // Assert
    //   expect(result).toEqual(mockExistingUser)
    //   expect(mockDatabaseService.query).toHaveBeenCalledWith(
    //     expect.stringContaining('SELECT * FROM users WHERE email ='),
    //     [email],
    //   )
    // })
    // it('should return null if user not found', async () => {
    //   // Arrange
    //   const email = 'nonexistent@example.com'
    //   mockDatabaseService.query.mockResolvedValue(mockEmptyUser)
    //   // Act
    //   const result = await authService.findOneByEmail(email)
    //   // Assert
    //   expect(result).toStrictEqual({ rows: [] })
    //   expect(mockDatabaseService.query).toHaveBeenCalledWith(
    //     expect.stringContaining('SELECT * FROM users WHERE email ='),
    //     [email],
    //   )
    // })
  })

  describe('login', () => {
    it('should return JWT tokens for valid user', async () => {
      // Arrange
      const user = mockExistingUser.rows[0]
      mockJwtService.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token')

      mockDatabaseService.query.mockResolvedValue({ rows: [user] })

      // Act
      const result = await authService.login(user)

      // Assert
      expect(result).toEqual({
        jwt_token: 'access_token',
        email: user.email,
        name: user.username,
        refresh_token: 'refresh_token',
      })
    })
  })
})
