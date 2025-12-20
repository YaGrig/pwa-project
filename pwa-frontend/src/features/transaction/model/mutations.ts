import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { TranscationApi } from "./api";
import { useTransaction } from "../lib/hooks/useTransaction";

export const useCreateTransactionMutation = () => {
  const queryClient = new QueryClient();
  const { createdEventSuccess, createdEventFailure } = useTransaction();

  return useMutation({
    mutationFn: TranscationApi.createTransaction,
    onSuccess: (payload) => {
      createdEventSuccess(payload);
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
