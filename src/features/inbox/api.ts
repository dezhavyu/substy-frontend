import { z } from "zod";
import { apiRequest } from "@/shared/api/client";
import { InboxPage, inboxPageSchema } from "@/features/inbox/schemas";

export interface GetInboxPageParams {
  cursor: string | null;
  limit: number;
}

const notificationPayloadSchema = z
  .object({
    event_type: z.string().optional(),
    message: z.string().optional()
  })
  .passthrough();

const notificationsPageSchema = z
  .object({
    items: z.array(
      z.object({
        id: z.string(),
        topic_id: z.string(),
        payload: notificationPayloadSchema.optional(),
        status: z.string(),
        created_at: z.string().datetime({ offset: true })
      })
    ),
    next_cursor: z.string().nullable().optional(),
    nextCursor: z.string().nullable().optional()
  })
  .transform((value) => ({
    items: value.items,
    nextCursor: value.next_cursor ?? value.nextCursor ?? null
  }));

function notificationTitle(item: z.infer<typeof notificationsPageSchema>["items"][number]): string {
  const eventType = item.payload?.event_type;
  if (eventType === "subscription.subscribed") {
    return "Subscribed";
  }
  if (eventType === "subscription.unsubscribed") {
    return "Unsubscribed";
  }
  return `Notification ${item.status}`;
}

function notificationMessage(item: z.infer<typeof notificationsPageSchema>["items"][number]): string {
  if (item.payload?.message) {
    return item.payload.message;
  }
  return `Topic: ${item.topic_id}`;
}

export async function getInboxPage(params: GetInboxPageParams): Promise<InboxPage> {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(params.limit));

  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  const page = await apiRequest({
    path: `/api/notifications/me?${searchParams.toString()}`,
    method: "GET",
    responseSchema: notificationsPageSchema
  });

  return inboxPageSchema.parse({
    items: page.items.map((item) => ({
      id: item.id,
      topic_name: item.topic_id,
      title: notificationTitle(item),
      message: notificationMessage(item),
      read: false,
      created_at: item.created_at
    })),
    nextCursor: page.nextCursor
  });
}
