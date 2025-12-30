import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "./api";
import { useLoginForm } from "../lib/hooks/useLoginForm";

export const useRegistrationMutation = () => {
  const queryClient = useQueryClient();
  const { authSuccess } = useLoginForm();

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
  const { authSuccess } = useLoginForm();

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
