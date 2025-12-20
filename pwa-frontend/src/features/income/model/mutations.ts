import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { IncomeApi } from "./api";
import { useIncome } from "../lib/hooks/useIncome";

export const useCreateIncomeMutation = () => {
  const queryClient = new QueryClient();
  const { createdEventSuccess, createdEventFailure } = useIncome();

  return useMutation({
    mutationFn: IncomeApi.createIncome,
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
  const { createdEventSuccess, createdEventFailure } = useIncome();

  return useMutation({
    mutationFn: IncomeApi.deleteIncome,
    onSuccess: (payload) => {
      createdEventSuccess(payload);
      //   queryClient.setQueryData(["auth", "user"], data.user);
    },

    onError: (error) => {
      createdEventFailure(error);
    },
  });
};
