import { Test, TestingModule } from '@nestjs/testing'
import { TransactionService } from './transaction.service'
import { DatabaseService } from '../../database/database.service'

const mockDatabaseService = {
  query: jest.fn(),
}

// const mockJwtService = {
//   sign: jest.fn(),
//   verify: jest.fn(),
// }

// const mockConfigService = {
//   get: jest.fn((key: string) => {
//     const config = {
//       JWT_SECRET: 'test-secret',
//       JWT_REFRESH_SECRET: 'test-refresh-secret',
//       JWT_EXPIRES_IN: '15m',
//       JWT_REFRESH_EXPIRES_IN: '7d',
//     }
//     return config[key]
//   }),
// }

describe('TransactionService', () => {
  let service: TransactionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<TransactionService>(TransactionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
