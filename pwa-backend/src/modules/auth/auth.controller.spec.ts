import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
// import { CreateUserDto } from './dto/create-auth.dto'
// import { Response } from 'express'
import { AuthController } from './auth.controller'
import { CreateUserDto } from './dto/create-auth.dto'
import { AuthGuard } from '@nestjs/passport'
import { ZodValidationPipe } from '../../common/pipes/zod.pipe'
import { ExecutionContext } from '@nestjs/common'
import { jwtAuthGuard } from '../../common/guards/jwt.guard'

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

  const mockAuthControllerResponse = {
    name: 'John Doe',
    email: 'john@example.com',
    jwt_token: 'new_jwt_token_abc',
  }

  const mockAuthServiceResponse = {
    ...mockAuthControllerResponse,
    refresh_token: 'new_refresh_token_xyz',
  }

  // Мок guard
  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest()
      request.user = 'id'
      return true
    }),
  }

  // Мок pipe
  const mockZodValidationPipe = {
    transform: jest.fn((value: string) => value),
  }

  const createMockResponse = () => {
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      getHeaders: jest.fn(),
      getCookieCalls: () => {},
    }
    mockResponse.getCookieCalls = () =>
      mockResponse.cookie.mock.calls as string[]

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
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(jwtAuthGuard)
      .useValue(mockAuthGuard)
      .overridePipe(ZodValidationPipe)
      .useValue(mockZodValidationPipe)
      .compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined()
    })
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
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000,
        }),
      )
      // 3. Проверяем конкретные значения в куки
      const cookieCall = mockResponse.getCookieCalls()[0]
      expect(cookieCall[1]).toBe(mockAuthServiceResponse.refresh_token) // значение
      expect(cookieCall[2]).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 900000, // 15 * 60 * 1000
      })
      // 4. Проверяем возвращаемое значение
      expect(result).toEqual(mockAuthControllerResponse)
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
          secure: true,
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
          secure: false,
        }),
      )
      // Cleanup
      process.env.NODE_ENV = originalNodeEnv
    })
  })
})
