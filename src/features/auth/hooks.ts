"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, register } from "@/features/auth/api";

export const authKeys = {
  me: ["auth", "me"] as const
};

export function useMeQuery() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    retry: false
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    }
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.clear();
    }
  });
}
