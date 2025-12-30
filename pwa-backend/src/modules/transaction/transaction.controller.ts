import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common'
import { TransactionService } from './transaction.service'
import {
  createTransactionSchema,
  type CreateTransactionDto,
} from './dto/create-transaction.dto'
import {
  updateTransactionSchema,
  type UpdateTransactionDto,
} from './dto/update-transaction.dto'
import { ZodValidationPipe } from '../../common/pipes/zod.pipe'
import type { CustomRequest } from '../../common/types/req.types'
import {
  type FindTransactionsQueryDTO,
  FindTransactionsQuerySchema,
} from './dto/get-all-query.dto'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('new')
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: CustomRequest,
  ) {
    return this.transactionService.create(createTransactionDto, req.user)
  }

  @Get('all')
  findAll(
    @Req() req: CustomRequest,
    @Query(new ZodValidationPipe(FindTransactionsQuerySchema))
    query: FindTransactionsQueryDTO,
  ) {
    console.log('???')
    return this.transactionService.findAll(
      req.user,
      query.offset,
      query.limit,
      query.sortBy,
    )
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.transactionService.findOne(+id, req.user)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    updateTransactionDto: UpdateTransactionDto,
    @Req() req: CustomRequest,
  ) {
    return this.transactionService.update(+id, updateTransactionDto, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string, req: CustomRequest) {
    return this.transactionService.remove(+id, req.user)
  }
}
