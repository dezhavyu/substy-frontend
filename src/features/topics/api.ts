import { z } from "zod";
import { apiRequest } from "@/shared/api/client";
import { TopicsPage, topicMutationResponseSchema, topicsPageSchema } from "@/features/topics/schemas";

export interface GetTopicsPageParams {
  cursor: string | null;
  limit: number;
}

const emptyResponseSchema = z.union([z.undefined(), z.object({}).passthrough()]);
const subscriptionSchema = z.object({
  id: z.string(),
  topic_id: z.string(),
  is_active: z.boolean()
});
const subscriptionsPageSchema = z
  .object({
    items: z.array(subscriptionSchema),
    next_cursor: z.string().nullable().optional(),
    nextCursor: z.string().nullable().optional()
  })
  .transform((value) => ({
    items: value.items,
    nextCursor: value.next_cursor ?? value.nextCursor ?? null
  }));
const subscriptionsPageLimit = 200;

type Subscription = z.infer<typeof subscriptionSchema>;
type SubscriptionsPage = z.infer<typeof subscriptionsPageSchema>;

async function listAllSubscriptions(): Promise<Subscription[]> {
  const subscriptions: Subscription[] = [];
  let cursor: string | null = null;

  do {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(subscriptionsPageLimit));
    if (cursor) {
      searchParams.set("cursor", cursor);
    }

    const page: SubscriptionsPage = await apiRequest({
      path: `/api/subscriptions/me?${searchParams.toString()}`,
      method: "GET",
      responseSchema: subscriptionsPageSchema
    });

    subscriptions.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);

  return subscriptions;
}

export async function getTopicsPage(params: GetTopicsPageParams): Promise<TopicsPage> {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(params.limit));

  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  const [topicsPage, subscriptions] = await Promise.all([
    apiRequest({
      path: `/api/topics?${searchParams.toString()}`,
      method: "GET",
      responseSchema: topicsPageSchema
    }),
    listAllSubscriptions()
  ]);

  const activeSubscriptionTopicIds = new Set(
    subscriptions.filter((subscription) => subscription.is_active).map((subscription) => subscription.topic_id)
  );

  return {
    ...topicsPage,
    items: topicsPage.items.map((topic) => ({
      ...topic,
      subscribed: activeSubscriptionTopicIds.has(topic.id)
    }))
  };
}

export async function subscribeToTopic(topicId: string) {
  await apiRequest({
    path: "/api/subscriptions",
    method: "POST",
    body: {
      topic_id: topicId
    },
    responseSchema: subscriptionSchema
  });

  return topicMutationResponseSchema.parse({
    subscribed: true
  });
}

export async function unsubscribeFromTopic(topicId: string) {
  const subscriptions = await listAllSubscriptions();
  const targetSubscription = subscriptions.find(
    (subscription) => subscription.topic_id === topicId && subscription.is_active
  );

  if (!targetSubscription) {
    return topicMutationResponseSchema.parse({
      subscribed: false
    });
  }

  await apiRequest({
    path: `/api/subscriptions/${targetSubscription.id}`,
    method: "DELETE",
    responseSchema: emptyResponseSchema
  });

  return topicMutationResponseSchema.parse({
    subscribed: false
  });
}
