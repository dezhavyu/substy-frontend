"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPreferences, updatePreferences } from "@/features/preferences/api";
import { Preferences } from "@/features/preferences/schemas";

export const preferencesKeys = {
  all: ["preferences"] as const
};

export function usePreferencesQuery() {
  return useQuery({
    queryKey: preferencesKeys.all,
    queryFn: getPreferences
  });
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Preferences) => updatePreferences(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: preferencesKeys.all });
    }
  });
}
