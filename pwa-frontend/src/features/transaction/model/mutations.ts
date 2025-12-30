import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { TranscationApi } from "./api";
import { useTransaction } from "../lib/hooks/useTransaction";
import { useGetAllTransactionsQuery } from "./queries";
import { TransactionResponse } from "../lib/types/transaction.type";

export const useCreateTransactionMutation = () => {
  const queryClient = new QueryClient();
  const { createdEventSuccess, createdEventFailure } = useTransaction();
  // const { refetch } = useGetAllTransactionsQuery();

  return useMutation({
    mutationFn: TranscationApi.createTransaction,
    onSuccess: (payload: TransactionResponse | undefined) => {
      if (payload) {
        createdEventSuccess(payload);
      }
    },

    onError: (error) => {
      createdEventFailure(error);
    },
  });
};

export const useDeleteTransactionMutation = () => {
  const queryClient = new QueryClient();
  const { createdEventSuccess, createdEventFailure } = useTransaction();

  return useMutation({
    mutationFn: TranscationApi.deleteTransaction,
    onSuccess: (payload) => {
      createdEventSuccess(payload);
      //   queryClient.setQueryData(["auth", "user"], data.user);
    },

    onError: (error) => {
      createdEventFailure(error);
    },
  });
};
