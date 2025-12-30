import { FetchOptions, fetchWithJWT } from "../../../common/http";
import { ApiResponse } from "../../../common/types/ResponceType";
import { useLoginForm } from "../../authorization/lib/hooks/useLoginForm";
import {
  Transaction,
  TransactionResponse,
  TransactionSortOptions,
} from "../lib/types/transaction.type";

export const TranscationApi = {
  async createTransaction(data: Transaction) {
    try {
      const payload: FetchOptions = {
        link: "http://localhost:3001/transaction/new",
        options: {
          method: "POST",
          // credentials: "include",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        },
      };

      const res = await fetchWithJWT(payload);
      const responseData = (await res) as ApiResponse<TransactionResponse>;

      if (!res.ok) {
        throw new Error(JSON.stringify(responseData));
      }

      if (responseData.success === false) {
        throw new Error(responseData.error?.message || "Validation failed");
      }

      return responseData.data;
    } catch (error) {
      console.error(error);
    }
  },

  async getAllTransactions(options: TransactionSortOptions) {
    try {
      const payload: FetchOptions = {
        link: `http://localhost:3001/transaction/all?offset=${
          options.page * options.limit
        }&limit=${options.limit}&sortBy=${options.sortBy}`,
        options: {
          method: "GET",
          credentials: "include",
        },
      };
      // const res = await fetch(
      //   `http://localhost:3001/transaction/all?offset=${
      //     options.page * options.limit
      //   }&limit=${options.limit}&sortBy=${options.sortBy}`,
      //   {
      //     method: "GET",
      //     credentials: "include",
      //   }
      // );

      const res = await fetchWithJWT(payload);

      return res;
    } catch (error) {
      console.error(error);
    }
  },

  async deleteTransaction(id: string) {
    const payload: FetchOptions = {
      link: `http://localhost:3001/transaction/${id}`,
      options: {
        method: "DELETE",
        credentials: "include",
      },
    };

    const res = await fetchWithJWT(payload);

    return res;
  },
};
