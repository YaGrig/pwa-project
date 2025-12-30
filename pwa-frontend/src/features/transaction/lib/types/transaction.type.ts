export interface Transaction {
  amount: number;
  description: string;
  photo_url?: string;
}

export interface TransactionResponse extends Transaction {
  id: string;
}

export type sortOptions = "created_at" | "description" | "amount";

export interface TransactionSortOptions {
  sortBy: sortOptions;
  page: number;
  limit: number;
}
