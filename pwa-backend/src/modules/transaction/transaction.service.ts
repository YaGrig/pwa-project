import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { DatabaseService } from '../../database/database.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { type Cache } from 'cache-manager'
import { Transaction } from './entities/transaction.entity'

@Injectable()
export class TransactionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly database: DatabaseService,
    // private readonly notification: NotificationGateway,
  ) {}

  private getTransactionKey(id: number): string {
    return `transaction:${id}`
  }

  private getTransactionsListKey(
    userId: string,
    offset: number,
    limit: number,
    category: string,
  ): string {
    return `transactions:${userId}:offset${offset}:limit${limit}:sort${category || 'default'}`
  }

  async create(dto: CreateTransactionDto, userId: string) {
    const isUserExist = await this.database.query(
      'SELECT id FROM users where id=$1',
      [userId],
    )

    if (!isUserExist.rows[0]) {
      throw new HttpException("User doesn't exists", HttpStatus.FORBIDDEN)
    }

    const transaction = await this.database.query(
      `INSERT INTO transactions (amount, description, user_id, photo_url) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, amount, description`,
      [dto.amount, dto.description, userId, dto.photo_url],
    )

    const newTransaction = transaction.rows[0]

    await this.cacheManager.set(
      this.getTransactionKey(newTransaction.id),
      newTransaction,
      300,
    )

    // await this.invalidateUserTransactionsCache(userId)
    // await this.refreshUserSummary(userId)

    return newTransaction
  }

  async findAll(
    userId: string = '2',
    offset: number,
    limit: number,
    category: string,
  ) {
    const cacheKey = this.getTransactionsListKey(
      userId,
      offset,
      limit,
      category,
    )
    console.log(cacheKey, 'checkey')
    const cachedResult = await this.cacheManager.get<any>(cacheKey)
    console.log(cachedResult, 'checkey')

    if (cachedResult) {
      console.log('Returning from cache:', cacheKey)
      return cachedResult as Transaction
    }
    try {
      const values: (string | number)[] = [userId]

      const query = [
        'SELECT id, amount, description, COUNT(*) OVER() as total_count FROM transactions where user_id=$1',
      ]

      if (category) {
        query.push(`ORDER BY ${category}`)
      }

      if (limit) {
        values.push(limit)
        query.push(`LIMIT $${values.length}`)
      }

      if (offset) {
        values.push(offset)
        query.push(`OFFSET $${values.length}`)
      }

      const transactions = (await this.database.query(query.join(' '), values))
        .rows
      const totalCount =
        transactions.length > 0 ? parseInt(transactions[0].total_count) : 0

      const result = {
        rows: transactions || [],
        count: totalCount,
      }

      await this.cacheManager.set(cacheKey, result, 180)

      return result
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error}`)
    }
  }

  async findOne(id: number, userId: string) {
    const cacheKey = this.getTransactionKey(id)

    // Пытаемся получить из кэша
    const cachedTransaction = await this.cacheManager.get<any>(cacheKey)
    if (cachedTransaction) {
      // Проверяем принадлежность пользователю
      if (cachedTransaction.user_id === userId) {
        console.log('Returning transaction from cache:', id)
        return cachedTransaction as Transaction
      }
    }

    console.log('Fetching transaction from DB:', id)
    const transactions = await this.database.query(
      'SELECT id, amount, description, user_id, created_at FROM transactions where id=$1 AND user_id=$2',
      [id, userId],
    )

    if (!transactions.rows[0]) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND)
    }

    const transaction = transactions.rows[0]

    await this.cacheManager.set(cacheKey, transaction, 300)

    return transaction
  }

  async update(id: number, dto: UpdateTransactionDto, userId: string = '1') {
    const transaction = await this.findOne(id, userId)
    if (!transaction) {
      throw new HttpException('transaction doesnt exit', HttpStatus.FORBIDDEN)
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new HttpException(
        'Update data cannot be empty',
        HttpStatus.BAD_REQUEST,
      )
    }

    const entries = Object.entries(dto)
    const values = Object.values(dto)

    const updates = entries
      .map((item, index) => `${item[0]}=$${index + 1}`)
      .join(',')

    await this.database.query(
      `UPDATE transactions SET ${updates} WHERE id=$${entries.length + 1}`,
      [...values, id],
    )

    await this.invalidateUserTransactionsCache(userId)
    // await this.refreshUserSummary(userId)
  }

  async remove(id: number, userId: string) {
    await this.database.query('DELETE FROM transactions where id=$1', [id])
    await this.cacheManager.del(this.getTransactionKey(id))

    await this.invalidateUserTransactionsCache(userId)
    // await this.refreshUserSummary(userId)
  }

  private async invalidateUserTransactionsCache(userId: string): Promise<void> {
    const keys = await this.getAllTransactionKeys(userId)

    for (const key of keys) {
      await this.cacheManager.del(key)
    }

    console.log(`Invalidated ${keys.length} cache keys for user ${userId}`)
  }

  private async getAllTransactionKeys(userId: string): Promise<string[]> {
    try {
      const pattern = `transactions:${userId}:*`
      const store = this.cacheManager.stores?.[0]
      const res: string[] = await store.store.keys(pattern)
      console.log(res, 'ressssss')
      return res
    } catch (error) {
      console.warn('Cannot get keys from store:', error.message)
    }

    return []
  }

  // private async refreshUserSummary(userId: string): Promise<void> {
  //   await this.database.query(
  //     `REFRESH MATERIALIZED VIEW CONCURRENTLY user_summary WHERE user_id = $1`,
  //     [userId],
  //   )
  // }
}
