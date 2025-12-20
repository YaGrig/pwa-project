import { useQuery } from "@tanstack/react-query";
import { IncomeApi } from "./api";
import { useIncome } from "../lib/hooks/useIncome";

export const useGetAllTransactionsQuery = () => {
  const { sort, getAllIncomes } = useIncome();

  return useQuery({
    queryKey: ["incomes", sort],
    queryFn: async () => {
      const res = await IncomeApi.getAllIncomes();
      getAllIncomes(res.data);
      return res.data;
    },
    staleTime: 5 * 1000,
  });
};
