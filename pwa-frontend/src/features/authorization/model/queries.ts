import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "./api";
import { authSuccess, authFailed } from "./stores";
import { useLoginForm } from "../lib/hooks/useLoginForm";

export const useRefreshQuery = () => {
  const { token } = useLoginForm();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", token],
    queryFn: () => AuthApi.refreshToken(),
  });

  return { data, isLoading, isError, refetch };
};
