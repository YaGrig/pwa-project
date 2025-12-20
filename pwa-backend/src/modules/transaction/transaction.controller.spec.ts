import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from './transaction.controller'
import { TransactionService } from './transaction.service'
import * as httpMocks from 'node-mocks-http'

const TransactionServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  remove: jest.fn(),
}

const createTransactionMock = {
  amount: 500,
  description: 'test',
}

describe('TransactionController', () => {
  let controller: TransactionController
  let service: TransactionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: TransactionServiceMock,
        },
      ],
    }).compile()

    controller = module.get<TransactionController>(TransactionController)
    service = module.get<TransactionService>(TransactionService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create transaction', async () => {
      TransactionServiceMock.create.mockResolvedValue('success')

      const result = await controller.create(
        createTransactionMock,
        httpMocks.createRequest(),
      )

      expect(TransactionServiceMock.create).toHaveBeenCalledTimes(1)
      expect(result).toBe('success')
    })
  })
})
