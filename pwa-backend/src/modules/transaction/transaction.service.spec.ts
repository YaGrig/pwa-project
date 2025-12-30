import { Test, TestingModule } from '@nestjs/testing'
import { TransactionService } from './transaction.service'
import { DatabaseService } from '../../database/database.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

const mockDatabaseService = {
  query: jest.fn(),
}

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  wrap: jest.fn(),
}

describe('TransactionService', () => {
  let service: TransactionService
  // let cache: typeof mockCache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCache,
        },
      ],
    }).compile()

    service = module.get<TransactionService>(TransactionService)
    // cache = module.get(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
