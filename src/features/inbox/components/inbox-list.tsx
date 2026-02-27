"use client";

import { useEffect, useRef } from "react";
import { Alert } from "@/shared/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Spinner } from "@/shared/ui/spinner";
import { useInboxInfinite } from "@/features/inbox/hooks";

export function InboxList(): JSX.Element {
  const inboxQuery = useInboxInfinite();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = inboxQuery;

  const items = inboxQuery.data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "300px"
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (inboxQuery.isPending) {
    return <Spinner label="Loading inbox..." />;
  }

  if (inboxQuery.isError) {
    return <Alert variant="error" title="Failed to load inbox" description={inboxQuery.error.message} />;
  }

  if (items.length === 0) {
    return <Alert title="Inbox is empty" description="No notifications yet." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>
                {item.topic_name ?? "General"} · {new Date(item.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={sentinelRef} />
      {inboxQuery.isFetchingNextPage ? <Spinner label="Loading more messages..." /> : null}
    </div>
  );
}
