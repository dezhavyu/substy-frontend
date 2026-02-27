import { z } from "zod";

const rawTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  subscribed: z.boolean().optional(),
  is_subscribed: z.boolean().optional()
});

export const topicSchema = rawTopicSchema.transform((value) => ({
  id: value.id,
  name: value.name,
  description: value.description ?? undefined,
  subscribed: value.subscribed ?? value.is_subscribed ?? false
}));

export type Topic = z.infer<typeof topicSchema>;

const rawTopicsPageSchema = z.object({
  items: z.array(topicSchema),
  next_cursor: z.string().nullable().optional(),
  nextCursor: z.string().nullable().optional()
});

export const topicsPageSchema = rawTopicsPageSchema.transform((value) => ({
  items: value.items,
  nextCursor: value.next_cursor ?? value.nextCursor ?? null
}));

export type TopicsPage = z.infer<typeof topicsPageSchema>;

export const topicMutationResponseSchema = z.union([
  z.undefined(),
  z
    .object({
      subscribed: z.boolean().optional(),
      is_subscribed: z.boolean().optional()
    })
    .passthrough()
]);
