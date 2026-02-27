"use client";

import { useMutation } from "@tanstack/react-query";
import { createIdempotencyKey } from "@/shared/lib/idempotency-key";
import { createNotification } from "@/features/notifications/api";
import { CreateNotificationRequest } from "@/features/notifications/schemas";

export function useCreateNotificationMutation() {
  return useMutation({
    mutationFn: (payload: CreateNotificationRequest) => {
      const idempotencyKey = createIdempotencyKey();
      return createNotification(payload, idempotencyKey);
    }
  });
}
