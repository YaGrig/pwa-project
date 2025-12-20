import { Amount } from './amount.entity'

export class Transaction {
  id: string
  amount: Amount
  description: string
  created_at: Date
  photo_url: string
  user_id: string
}
