import { useQuery } from "@tanstack/react-query";
import { AnalyticsAPI } from "./api";
import { useLoginForm } from "../../authorization/lib/hooks/useLoginForm";
import { useFilterAnalytics } from "../lib/hooks";
import { AnalyticsData } from "../lib/hooks/types/filter";
import { SuccessResponse } from "../../../common/types/ResponceType";

export const useGetAnalytics = () => {
  // const { token } = useLoginForm();
  const token = localStorage.getItem("token");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["allAnalytics", token],
    queryFn: AnalyticsAPI.getUserAnalytics,
    enabled: !!token,
  });
  return { data, isLoading, isError };
};

export const useGetAnalyticsMonth = () => {
  // const { token } = useLoginForm();
  const token = localStorage.getItem("token");

  const { filterFields } = useFilterAnalytics();

  console.log(
    !!token && filterFields.endDate && filterFields.startDate,
    filterFields,
    "hehe"
  );

  const { data, isLoading, isError, refetch } = useQuery<
    SuccessResponse<AnalyticsData[]>
  >({
    queryKey: [
      "monthAnalytics",
      token,
      filterFields.startDate,
      filterFields.endDate,
    ],
    queryFn: () => AnalyticsAPI.getUserAnalyticsMonth(filterFields),
    enabled: !!token && !!filterFields.endDate && !!filterFields.startDate,
  });
  return { data, isLoading, isError };
};
