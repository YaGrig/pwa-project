import { useQuery } from "@tanstack/react-query";
import { TranscationApi } from "./api";
import { useTransaction } from "../lib/hooks/useTransaction";
import { useLoginForm } from "../../authorization/lib/hooks/useLoginForm";

export const useGetAllTransactionsQuery = () => {
  const { sortOptions } = useTransaction();
  // const { token } = useLoginForm();
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["transactions", sortOptions, token],
    queryFn: async () => {
      const res = await TranscationApi.getAllTransactions(sortOptions);
      return res.data;
    },
    enabled: !!token,
    // staleTime: 5 * 1000,
  });
};
