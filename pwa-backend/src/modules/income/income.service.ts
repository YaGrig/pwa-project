import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common'
import { CreateIncomeDto } from './dto/create-income.dto'
import { UpdateIncomeDTO } from './dto/update-income.dto'
import { DatabaseService } from '@/database/database.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Injectable()
export class IncomeService {
  constructor(private database: DatabaseService) {}
  async create(dto: CreateIncomeDto, userId: string) {
    const isUserExist = await this.database.query(
      'SELECT id FROM users where id=$1',
      [userId],
    )
    if (!isUserExist) {
      throw new UnauthorizedException("user doesn't exit")
    }

    const income = await this.database.query(
      'INSERT INTO income (description, amount) VALUES ($1, $2)',
      [dto.desription, dto.amount],
    )

    await this.database.query(
      'INSERT INTO users_income (user_id, income_id) VALUES ($1, $2)',
      [userId, income.rows[0].id],
    )

    const newIncome = await this.database.query(
      'INSERT INTO income (description, amount) VALUES ($1, $2)',
      [dto.desription, dto.amount],
    )

    return newIncome
  }

  async findAll(userId: string) {
    const isUserExist = await this.database.query(
      'SELECT id FROM users where id=$1',
      [userId],
    )

    if (!isUserExist) {
      throw new UnauthorizedException('user doesnt exist')
    }

    const listOfIncomes = await this.database.query(
      'SELECT id, amount, description FROM income WHERE user_id=$1',
      [userId],
    )

    return listOfIncomes.rows
  }

  async findOne(id: number) {
    const res = await this.database.query(
      'SELECT id, description, amount FROM income WHERE id=$1',
      [id],
    )
    return res.rows[0] || []
  }

  async update(id: number, dto: UpdateIncomeDTO, userId: string) {
    const isUserExist = await this.database.query(
      'SELECT id FROM users where id=$1',
      [userId],
    )

    if (!isUserExist) {
      throw new UnauthorizedException('user doesnt exist')
    }

    const values = Object.values(dto)

    const updates = Object.entries(dto)
      .map((item, index) => `${item[0]}=$${index + 1}`)
      .join(',')

    const updated_income = this.database.query(
      `UPDATE income SET(${updates}) WHERE id=$${values.length + 1}`,
      [...values, id],
    )

    return updated_income
  }

  async remove(id: number) {
    await this.database.query('DELETE FROM income WHERE id=$1', [id])
  }
}
