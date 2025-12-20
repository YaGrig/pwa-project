import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common'
import { IncomeService } from './income.service'
import { type CreateIncomeDto } from './dto/create-income.dto'
// import { ZodValidationPipe } from '@/common/pipes/zod.pipe'
import type { CustomRequest } from '@/common/types/req.types'

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post('new')
  // @UsePipes(new ZodValidationPipe(CreateIncomeSchema))
  create(@Body() createIncomeDto: CreateIncomeDto, @Req() req: CustomRequest) {
    return this.incomeService.create(createIncomeDto, req.user)
  }

  @Get('all')
  findAll(@Req() req: CustomRequest) {
    return this.incomeService.findAll(req.user)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncomeDto: CreateIncomeDto,
    @Req() req: CustomRequest,
  ) {
    return this.incomeService.update(+id, updateIncomeDto, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeService.remove(+id)
  }
}
