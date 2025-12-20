import { useQuery } from "@tanstack/react-query";
import { TranscationApi } from "./api";
import { useTransaction } from "../lib/hooks/useTransaction";

export const useGetAllTransactionsQuery = () => {
  const { sortOptions } = useTransaction();

  return useQuery({
    queryKey: ["transactions", sortOptions],
    queryFn: async () => {
      const res = await TranscationApi.getAllTransactions(sortOptions);
      return res.data;
    },
    // staleTime: 5 * 1000,
  });
};
