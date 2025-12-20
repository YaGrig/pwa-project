import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "./api";
import { authSuccess, authFailed } from "./stores";
import { useLoginForm } from "../lib/hooks/useLoginForm";

export const useRegistrationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthApi.register,
    onSuccess: (data) => {
      authSuccess(data);
      queryClient.setQueryData(["auth", "user"], data.user);
    },

    onError: (data) => {
      console.log(data);
      // authFailed(data);
    },
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthApi.login,
    onSuccess: (data) => {
      authSuccess(data);
      queryClient.setQueryData(["auth", "user"], data.user);
    },

    onError: (data) => {
      console.log(data);
      // authFailed(data);
    },
  });
};
