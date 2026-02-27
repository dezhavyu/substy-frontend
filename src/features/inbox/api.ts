import { z } from "zod";
import { apiRequest } from "@/shared/api/client";
import { InboxPage, inboxPageSchema } from "@/features/inbox/schemas";

export interface GetInboxPageParams {
  cursor: string | null;
  limit: number;
}

const notificationsPageSchema = z
  .object({
    items: z.array(
      z.object({
        id: z.string(),
        topic_id: z.string(),
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
      title: `Notification ${item.status}`,
      message: `Topic: ${item.topic_id}`,
      read: false,
      created_at: item.created_at
    })),
    nextCursor: page.nextCursor
  });
}
