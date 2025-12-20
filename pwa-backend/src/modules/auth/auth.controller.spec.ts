import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { CreateUserDto } from './dto/create-auth.dto'
import { Response } from 'express'
import { AuthController } from './auth.controller'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService

  const mockCreateUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    refresh_token: 'existing_token',
    role: 'User',
  }

  const mockAuthServiceResponse = {
    refresh_token: 'new_refresh_token_xyz',
    jwt_token: 'new_jwt_token_abc',
  }

  // Создаем более продвинутый мок для Response
  const createMockResponse = () => {
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(), // Возвращает this для chaining
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      getHeaders: jest.fn(),
      // Добавляем методы для проверки
      getCookieCalls: () => mockResponse.cookie.mock.calls,
      getLastCookieCall: () =>
        mockResponse.cookie.mock.calls[
          mockResponse.cookie.mock.calls.length - 1
        ],
    }
    return mockResponse
  }

  const mockAuthService = {
    register: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register user and set cookies', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockAuthServiceResponse)
      const mockResponse = createMockResponse()

      // Act
      const result = await controller.register(
        mockCreateUserDto,
        mockResponse as any,
      )

      // Assert
      // 1. Проверяем вызов сервиса
      expect(authService.register).toHaveBeenCalledWith(mockCreateUserDto)
      expect(authService.register).toHaveBeenCalledTimes(1)

      // 2. Проверяем установку куки
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1)
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthServiceResponse.refresh_token,
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000,
        }),
      )

      // 3. Проверяем конкретные значения в куки
      const cookieCall = mockResponse.getLastCookieCall()
      expect(cookieCall[0]).toBe('access_token') // название куки
      expect(cookieCall[1]).toBe(mockAuthServiceResponse.refresh_token) // значение
      expect(cookieCall[2]).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 900000, // 15 * 60 * 1000
      })

      // 4. Проверяем возвращаемое значение
      expect(result).toBe(mockAuthServiceResponse.jwt_token)
    })

    it('should handle service errors properly', async () => {
      // Arrange
      const error = new Error('Registration failed')
      mockAuthService.register.mockRejectedValue(error)
      const mockResponse = createMockResponse()

      // Act & Assert
      await expect(
        controller.register(mockCreateUserDto, mockResponse as any),
      ).rejects.toThrow('Registration failed')

      expect(mockResponse.cookie).not.toHaveBeenCalled()
    })

    it('should set secure cookie in production environment', async () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      mockAuthService.register.mockResolvedValue(mockAuthServiceResponse)
      const mockResponse = createMockResponse()

      // Act
      await controller.register(mockCreateUserDto, mockResponse as any)

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthServiceResponse.refresh_token,
        expect.objectContaining({
          secure: true, // Должно быть true в production
        }),
      )

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv
    })

    it('should not set secure cookie in development environment', async () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      mockAuthService.register.mockResolvedValue(mockAuthServiceResponse)
      const mockResponse = createMockResponse()

      // Act
      await controller.register(mockCreateUserDto, mockResponse as any)

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthServiceResponse.refresh_token,
        expect.objectContaining({
          secure: false, // Должно быть false в development
        }),
      )

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv
    })
  })
})
