import { apiRequest } from "@/shared/api/client";
import {
  CreateNotificationRequest,
  createNotificationResponseSchema
} from "@/features/notifications/schemas";

export async function createNotification(
  payload: CreateNotificationRequest,
  idempotencyKey: string
) {
  return apiRequest({
    path: "/api/notifications",
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey
    },
    body: {
      topic_id: payload.topic_id,
      payload: {
        message: payload.message
      },
      scheduled_at: payload.scheduled_at,
      idempotency_key: idempotencyKey
    },
    responseSchema: createNotificationResponseSchema
  });
}
