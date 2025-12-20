import {
  Transaction,
  TransactionSortOptions,
} from "../lib/types/transaction.type";

export const TranscationApi = {
  async createTransaction(data: Transaction) {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/transaction/new`,
      {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.json();
  },

  async getAllTransactions(options: TransactionSortOptions) {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/transaction/all?offset=${
        options.page * options.limit
      }&limit=${options.limit}&sortBy=${options.sortBy}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    return res.json();
  },

  async deleteTransaction(id: string) {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/transaction/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return res.json();
  },
};
