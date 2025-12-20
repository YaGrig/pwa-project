import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "./api";
import { authSuccess, authFailed } from "./stores";
import { useLoginForm } from "../lib/hooks/useLoginForm";

export const useMeQuery = () => {
  const { token } = useLoginForm();
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", token], // токен в queryKey
    queryFn: () => AuthApi.getMe(token),
    enabled: !!token, // запрос выполнится только когда есть токен
  });

  return { data, isLoading, isError, refetch };
};