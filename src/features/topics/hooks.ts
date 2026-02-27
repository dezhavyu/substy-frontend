"use client";

import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { env } from "@/shared/lib/env";
import { getTopicsPage, subscribeToTopic, unsubscribeFromTopic } from "@/features/topics/api";
import { TopicsPage } from "@/features/topics/schemas";

export const topicsKeys = {
  all: ["topics"] as const,
  infinite: (limit: number) => ["topics", "infinite", limit] as const
};

interface ToggleTopicPayload {
  topicId: string;
  subscribe: boolean;
}

interface ToggleContext {
  previousData: InfiniteData<TopicsPage, string | null> | undefined;
}

function patchTopicSubscription(
  data: InfiniteData<TopicsPage, string | null> | undefined,
  topicId: string,
  subscribed: boolean
): InfiniteData<TopicsPage, string | null> | undefined {
  if (!data) {
    return data;
  }

  return {
    pageParams: data.pageParams,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subscribed
            }
          : topic
      )
    }))
  };
}

export function useTopicsInfinite(limit: number = env.topicsPageSize) {
  const initialCursor: string | null = null;

  return useInfiniteQuery<
    TopicsPage,
    Error,
    InfiniteData<TopicsPage, string | null>,
    ReturnType<typeof topicsKeys.infinite>,
    string | null
  >({
    queryKey: topicsKeys.infinite(limit),
    initialPageParam: initialCursor,
    queryFn: ({ pageParam }) => getTopicsPage({ cursor: pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}

export function useToggleTopicSubscription(limit: number = env.topicsPageSize) {
  const queryClient = useQueryClient();
  const key = topicsKeys.infinite(limit);

  return useMutation({
    mutationFn: async ({ topicId, subscribe }: ToggleTopicPayload) => {
      if (subscribe) {
        return subscribeToTopic(topicId);
      }

      return unsubscribeFromTopic(topicId);
    },
    onMutate: async ({ topicId, subscribe }) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousData = queryClient.getQueryData<InfiniteData<TopicsPage, string | null>>(key);

      queryClient.setQueryData<InfiniteData<TopicsPage, string | null> | undefined>(
        key,
        patchTopicSubscription(previousData, topicId, subscribe)
      );

      return {
        previousData
      } satisfies ToggleContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(key, context.previousData);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.all });
    }
  });
}
