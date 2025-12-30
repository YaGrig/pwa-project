export interface FilterFields {
  startDate: string;
  endDate: string;
}

export interface AnalyticsData {
  month_start: string;
  month_end: string;
  year_month: string;
  month_number: string;
  month_name: string;
  date: string;
  transactions_count: number;
  total_expenses: string;
  total_incomes: string;
  balance: string;
  income_to_expense_ratio: string;
  updated_at: string;
}
