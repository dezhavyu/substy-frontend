import { z } from "zod";

export const inboxItemSchema = z.object({
  id: z.string(),
  topic_name: z.string().optional(),
  title: z.string(),
  message: z.string(),
  read: z.boolean().optional(),
  created_at: z.string().datetime({ offset: true })
});

export type InboxItem = z.infer<typeof inboxItemSchema>;

const rawInboxPageSchema = z.object({
  items: z.array(inboxItemSchema),
  next_cursor: z.string().nullable().optional(),
  nextCursor: z.string().nullable().optional()
});

export const inboxPageSchema = rawInboxPageSchema.transform((value) => ({
  items: value.items,
  nextCursor: value.next_cursor ?? value.nextCursor ?? null
}));

export type InboxPage = z.infer<typeof inboxPageSchema>;
