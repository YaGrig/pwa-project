export interface Transaction {
  amount: string;
  description: string;
  photo_url?: string;
}

export type sortOptions = "created_at" | "description" | "amount";

export interface TransactionSortOptions {
  sortBy: sortOptions;
  page: number;
  limit: number;
}
