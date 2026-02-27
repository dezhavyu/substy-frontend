"use client";

import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { env } from "@/shared/lib/env";
import { getInboxPage } from "@/features/inbox/api";
import { InboxPage } from "@/features/inbox/schemas";

export const inboxKeys = {
  infinite: (limit: number) => ["inbox", "infinite", limit] as const
};

export function useInboxInfinite(limit: number = env.inboxPageSize) {
  const initialCursor: string | null = null;

  return useInfiniteQuery<
    InboxPage,
    Error,
    InfiniteData<InboxPage, string | null>,
    ReturnType<typeof inboxKeys.infinite>,
    string | null
  >({
    queryKey: inboxKeys.infinite(limit),
    initialPageParam: initialCursor,
    queryFn: ({ pageParam }) => getInboxPage({ cursor: pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}
