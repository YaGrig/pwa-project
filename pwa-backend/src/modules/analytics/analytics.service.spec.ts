import { Test, TestingModule } from '@nestjs/testing'
import { AnalyticsService } from './analytics.service'
import { DatabaseService } from '../../database/database.service'
import { AnalyticsMonthDTO } from './dto/analytics-month.dto'

// Мок сервиса базы данных
const mockDatabaseService = {
  query: jest.fn(),
}

describe('AnalyticsService', () => {
  let service: AnalyticsService
  let databaseService: DatabaseService

  beforeEach(async () => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<AnalyticsService>(AnalyticsService)
    databaseService = module.get<DatabaseService>(DatabaseService)
  })

  describe('Конструктор и инициализация', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should have database service injected', () => {
      expect(databaseService).toBeDefined()
      expect(databaseService).toBe(mockDatabaseService)
    })
  })

  describe('getUserAnalytics', () => {
    const userId = 'user-123'

    it('should call database with correct query and parameters', async () => {
      // Arrange
      const expectedRow = {
        user_id: userId,
        total_income: 15000,
        total_expenses: 8000,
        balance: 7000,
      }
      mockDatabaseService.query.mockResolvedValue({ rows: [expectedRow] })

      // Act
      const result = await service.getUserAnalytics(userId)

      // Assert
      expect(databaseService.query).toHaveBeenCalledTimes(1)
      expect(databaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM user_summary WHERE user_id = $1',
        [userId],
      )
      expect(result).toEqual(expectedRow)
    })

    it('should return first row from result', async () => {
      // Arrange
      const rows = [
        { user_id: userId, total: 1000 },
        { user_id: userId, total: 2000 }, // Этот не должен вернуться
      ]
      mockDatabaseService.query.mockResolvedValue({ rows })

      // Act
      const result = await service.getUserAnalytics(userId)

      // Assert
      expect(result).toEqual(rows[0])
    })

    it('should return undefined when no rows found', async () => {
      // Arrange
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      const result = await service.getUserAnalytics(userId)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockDatabaseService.query.mockRejectedValue(error)

      // Act & Assert
      await expect(service.getUserAnalytics(userId)).rejects.toThrow(
        'Database connection failed',
      )
    })

    it('should work with different user IDs', async () => {
      // Arrange
      const testUserId = 'test-user-456'
      const expectedRow = { user_id: testUserId, total: 5000 }
      mockDatabaseService.query.mockResolvedValue({ rows: [expectedRow] })

      // Act
      const result = await service.getUserAnalytics(testUserId)

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        testUserId,
      ])
      expect(result.user_id).toBe(testUserId)
    })

    it('should handle null/empty userId', async () => {
      // Arrange
      const emptyUserId = ''
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      const result = await service.getUserAnalytics(emptyUserId)

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        emptyUserId,
      ])
      expect(result).toBeUndefined()
    })
  })

  describe('getUserAnalyticsMonth', () => {
    const userId = 'user-123'
    const validDto: AnalyticsMonthDTO = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    }

    it('should call database with correct query and parameters', async () => {
      // Arrange
      const expectedRows = [
        {
          month_start: new Date('2024-01-01'),
          month_end: new Date('2024-01-01'),
          year_month: '2024-01',
          month_number: 1,
          month_name: 'January',
          transactions_count: 10,
          total_expenses: 1000,
          total_incomes: 2000,
          balance: 1000,
          income_to_expense_ratio: 200,
          updated_at: new Date('2024-01-01T10:00:00Z'),
        },
      ]
      mockDatabaseService.query.mockResolvedValue({ rows: expectedRows })

      // Act
      const result = await service.getUserAnalyticsMonth(validDto, userId)

      // Assert
      expect(databaseService.query).toHaveBeenCalledTimes(1)

      // Проверяем, что передан SQL запрос
      const sqlQuery = mockDatabaseService.query.mock.calls[0][0]
      expect(sqlQuery).toContain('SELECT')
      expect(sqlQuery).toContain('FROM user_summary')
      expect(sqlQuery).toContain('WHERE user_id = $1')
      expect(sqlQuery).toContain("AND period = 'day'")
      expect(sqlQuery).toContain('ORDER BY period_start ASC')

      // Проверяем параметры
      const params = mockDatabaseService.query.mock.calls[0][1]
      expect(params).toEqual([userId, validDto.startDate, validDto.endDate])

      expect(result).toEqual(expectedRows)
    })

    it('should return all rows from result', async () => {
      // Arrange
      const expectedRows = [
        { month_name: 'January', total_incomes: 1000 },
        { month_name: 'February', total_incomes: 1200 },
        { month_name: 'March', total_incomes: 1500 },
      ]
      mockDatabaseService.query.mockResolvedValue({ rows: expectedRows })

      // Act
      const result = await service.getUserAnalyticsMonth(validDto, userId)

      // Assert
      expect(result).toHaveLength(3)
      expect(result).toEqual(expectedRows)
    })

    it('should return empty array when no data found', async () => {
      // Arrange
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      const result = await service.getUserAnalyticsMonth(validDto, userId)

      // Assert
      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const error = new Error('SQL syntax error')
      mockDatabaseService.query.mockRejectedValue(error)

      // Act & Assert
      await expect(
        service.getUserAnalyticsMonth(validDto, userId),
      ).rejects.toThrow('SQL syntax error')
    })

    it('should work with different date ranges', async () => {
      // Arrange
      const dtoWithDifferentDates: AnalyticsMonthDTO = {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-29'),
      }
      const expectedRows = [{ month_name: 'February', total: 800 }]
      mockDatabaseService.query.mockResolvedValue({ rows: expectedRows })

      // Act
      const result = await service.getUserAnalyticsMonth(
        dtoWithDifferentDates,
        userId,
      )

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        userId,
        dtoWithDifferentDates.startDate,
        dtoWithDifferentDates.endDate,
      ])
      expect(result[0].month_name).toBe('February')
    })

    it('should handle edge dates correctly', async () => {
      // Arrange
      const edgeDto: AnalyticsMonthDTO = {
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-12-31'),
      }
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      const result = await service.getUserAnalyticsMonth(edgeDto, userId)

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        userId,
        edgeDto.startDate,
        edgeDto.endDate,
      ])
      expect(result).toEqual([])
    })

    it('should work with same start and end date', async () => {
      // Arrange
      const singleDayDto: AnalyticsMonthDTO = {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }
      const expectedRows = [
        {
          month_start: new Date('2024-01-15'),
          month_end: new Date('2024-01-15'),
          total_incomes: 500,
          total_expenses: 300,
        },
      ]
      mockDatabaseService.query.mockResolvedValue({ rows: expectedRows })

      // Act
      const result = await service.getUserAnalyticsMonth(singleDayDto, userId)

      // Assert
      expect(result[0].month_start).toEqual(singleDayDto.startDate)
      expect(result[0].month_end).toEqual(singleDayDto.endDate)
    })

    it('should handle null/undefined userId', async () => {
      // Arrange
      const nullUserId = null as any
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      const result = await service.getUserAnalyticsMonth(validDto, nullUserId)

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        nullUserId,
        validDto.startDate,
        validDto.endDate,
      ])
      expect(result).toEqual([])
    })
  })

  describe('SQL injection safety', () => {
    it('should use parameterized queries to prevent SQL injection', async () => {
      // Arrange
      const maliciousUserId = "user'; DROP TABLE users; --"
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      await service.getUserAnalytics(maliciousUserId)

      // Assert
      const params = mockDatabaseService.query.mock.calls[0][1]
      expect(params[0]).toBe(maliciousUserId) // Параметр передается как значение, а не часть SQL
    })

    it('should handle special characters in userId', async () => {
      // Arrange
      const specialUserId = "user-123' OR '1'='1"
      mockDatabaseService.query.mockResolvedValue({ rows: [] })

      // Act
      await service.getUserAnalytics(specialUserId)

      // Assert
      const sqlQuery = mockDatabaseService.query.mock.calls[0][0]
      expect(sqlQuery).toContain('WHERE user_id = $1') // Параметризованный запрос
    })
  })
})
