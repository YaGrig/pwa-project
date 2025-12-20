import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { DatabaseService } from '../../database/database.service'

@Injectable()
export class TransactionService {
  constructor(
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly database: DatabaseService,
    // private readonly notification: NotificationGateway,
  ) {}
  async create(dto: CreateTransactionDto, userId: string = '1') {
    const isUserExist = await this.database.query(
      'SELECT id FROM users where id=$1',
      [userId],
    )

    if (!isUserExist.rows[0]) {
      throw new HttpException("User doesn't exists", HttpStatus.FORBIDDEN)
    }

    await this.database.query(
      'INSERT INTO transactions (amount, description, user_id, photo_url) VALUES ($1, $2, $3, $4)',
      [dto.amount, dto.description, userId, dto.photo_url],
    )

    return 'success'
  }

  async findAll(
    userId: string = '2',
    offset: number,
    limit: number,
    category: string,
  ) {
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

      return {
        rows: transactions || [],
        count: totalCount,
      }
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error}`)
    }
  }

  async findOne(id: number, userId: string) {
    const transactions = await this.database.query(
      'SELECT id, amount, description FROM transactions where id=$1',
      [id],
    )

    return transactions.rows[0] || []
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
  }

  async remove(id: number, userId: string) {
    await this.database.query('DELETE FROM transactions where id=$1', [id])
  }
}
