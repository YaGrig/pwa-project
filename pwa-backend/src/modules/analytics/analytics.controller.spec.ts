import { Test, TestingModule } from '@nestjs/testing'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ZodValidationPipe } from '../../common/pipes/zod.pipe'
import { CustomRequest } from '@/common/types/req.types'
import * as httpMocks from 'node-mocks-http'

// Мок сервиса
const mockAnalyticsService = {
  getUserAnalytics: jest.fn(),
  getUserAnalyticsMonth: jest.fn(),
}

// Мок пользователя (строка, как в реальном сервисе)
const mockUserId = 'user-123'

// Мок пользователя для request
const mockUser = mockUserId

// Мок запроса
const mockRequest: CustomRequest = {
  ...httpMocks.createRequest(),
  user: mockUser,
}

// Мок guard
const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    request.user = mockUser
    return true
  }),
}

// Мок pipe
const mockZodValidationPipe = {
  transform: jest.fn((value: string) => value),
}

describe('AnalyticsController', () => {
  let controller: AnalyticsController
  let analyticsService: AnalyticsService

  beforeEach(async () => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt')) // Переопределяем конкретный guard
      .useValue(mockAuthGuard)
      .overridePipe(ZodValidationPipe) // Переопределяем pipe
      .useValue(mockZodValidationPipe)
      .compile()

    controller = module.get<AnalyticsController>(AnalyticsController)
    analyticsService = module.get<AnalyticsService>(AnalyticsService)
  })

  describe('Конструктор и инициализация', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined()
    })

    it('should have analyticsService injected', () => {
      expect(analyticsService).toBeDefined()
      expect(analyticsService).toBe(mockAnalyticsService)
    })
  })

  describe('GET /analytics/all', () => {
    it('should call getUserAnalytics with correct user', async () => {
      // Arrange
      const expectedResult = {
        totalIncome: 15000,
        totalExpenses: 8000,
        balance: 7000,
      }
      mockAnalyticsService.getUserAnalytics.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.getUserAnalytics(mockRequest)

      // Assert
      expect(analyticsService.getUserAnalytics).toHaveBeenCalledTimes(1)
      expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith(mockUserId)
      expect(result).toEqual(expectedResult)
    })

    it('should handle errors from service', async () => {
      // Arrange
      const error = new Error('Database error')
      mockAnalyticsService.getUserAnalytics.mockRejectedValue(error)

      // Act & Assert
      await expect(controller.getUserAnalytics(mockRequest)).rejects.toThrow(
        'Database error',
      )

      expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith(mockUserId)
    })

    it('should return empty object if user has no analytics', async () => {
      // Arrange
      mockAnalyticsService.getUserAnalytics.mockResolvedValue({})

      // Act
      const result = await controller.getUserAnalytics(mockRequest)

      // Assert
      expect(result).toEqual({})
      expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('POST /analytics/month', () => {
    const validDto = {
      startDate: new Date('2024-01-11'),
      endDate: new Date('2024-01-14'),
    }

    it('should call getUserAnalyticsMonth with correct parameters', async () => {
      // Arrange
      const expectedResult = [
        {
          month_start: new Date('2024-01-11'),
          month_end: new Date('2024-01-11'),
          year_month: '2024-01',
          month_number: 1,
          month_name: 'January',
          transactions_count: 5,
          total_expenses: 1000,
          total_incomes: 2000,
          balance: 1000,
          income_to_expense_ratio: 200,
          updated_at: new Date(),
        },
      ]
      mockAnalyticsService.getUserAnalyticsMonth.mockResolvedValue(
        expectedResult,
      )

      // Act
      const result = await controller.getUserAnalyticsMonth(
        validDto,
        mockRequest,
      )

      // Assert
      expect(analyticsService.getUserAnalyticsMonth).toHaveBeenCalledTimes(1)
      expect(analyticsService.getUserAnalyticsMonth).toHaveBeenCalledWith(
        validDto,
        mockUserId,
      )
      expect(result).toEqual(expectedResult)
    })

    it('should handle service errors gracefully', async () => {
      // Arrange
      const error = new Error('Failed to fetch monthly analytics')
      mockAnalyticsService.getUserAnalyticsMonth.mockRejectedValue(error)

      // Act & Assert
      await expect(
        controller.getUserAnalyticsMonth(validDto, mockRequest),
      ).rejects.toThrow('Failed to fetch monthly analytics')
    })

    it('should work with empty array in response', async () => {
      // Arrange
      mockAnalyticsService.getUserAnalyticsMonth.mockResolvedValue([])

      // Act
      const result = await controller.getUserAnalyticsMonth(
        validDto,
        mockRequest,
      )

      // Assert
      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Guard и Pipe проверки', () => {
    it('should have AuthGuard applied', () => {
      // Проверяем метаданные контроллера
      const guardReflect = Reflect.getMetadata(
        '__guards__',
        AnalyticsController,
      )
      expect(guardReflect).toBeDefined()
    })

    it('should have ZodValidationPipe on POST method', () => {
      // Проверяем метаданные метода
      const pipeReflect = Reflect.getMetadata(
        '__pipes__',
        AnalyticsController.prototype.getUserAnalyticsMonth,
      )
      expect(pipeReflect).toBeDefined()
    })

    it('guard should set user in request', () => {
      // Создаем mock execution context
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext

      // Act
      mockAuthGuard.canActivate(mockExecutionContext)

      // Assert
      const request = mockExecutionContext.switchToHttp().getRequest()
      expect(request.user).toEqual(mockUser)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user object', async () => {
      // Arrange
      const emptyRequest: CustomRequest = {
        ...httpMocks.createRequest(),
        user: '',
      }
      const expectedResult = { message: 'No data available' }
      mockAnalyticsService.getUserAnalytics.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.getUserAnalytics(emptyRequest)

      // Assert
      expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith('')
      expect(result).toEqual(expectedResult)
    })

    it('should handle null user', async () => {
      // Arrange
      const nullUserRequest: CustomRequest = {
        ...httpMocks.createRequest(),
        user: null as any,
      }
      const expectedResult = null
      mockAnalyticsService.getUserAnalytics.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.getUserAnalytics(nullUserRequest)

      // Assert
      expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith(null)
      expect(result).toBeNull()
    })
  })
})
