"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ApiError } from "@/shared/api/errors";
import { env } from "@/shared/lib/env";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Spinner } from "@/shared/ui/spinner";
import { useToggleTopicSubscription, useTopicsInfinite } from "@/features/topics/hooks";

export function TopicsFeed(): JSX.Element {
  const limit = env.topicsPageSize;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const topicsQuery = useTopicsInfinite(limit);
  const toggleMutation = useToggleTopicSubscription(limit);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = topicsQuery;

  const topics = topicsQuery.data?.pages.flatMap((page) => page.items) ?? [];

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

  if (topicsQuery.isPending) {
    return <Spinner label="Loading topics..." />;
  }

  if (topicsQuery.isError) {
    return <Alert variant="error" title="Failed to load topics" description={topicsQuery.error.message} />;
  }

  if (topics.length === 0) {
    return <Alert title="No topics yet" description="No topics are available at the moment." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <CardTitle>{topic.name}</CardTitle>
              <CardDescription>{topic.description ?? "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant={topic.subscribed ? "secondary" : "default"}
                disabled={toggleMutation.isPending}
                onClick={() => {
                  toggleMutation.mutate(
                    {
                      topicId: topic.id,
                      subscribe: !topic.subscribed
                    },
                    {
                      onError: (error) => {
                        const message = error instanceof ApiError ? error.message : "Subscription update failed";
                        toast.error(message);
                      }
                    }
                  );
                }}
                data-testid={`topic-action-${topic.id}`}
              >
                {topic.subscribed ? "Unsubscribe" : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={sentinelRef} />

      {topicsQuery.isFetchingNextPage ? <Spinner label="Loading more topics..." /> : null}
      {!topicsQuery.hasNextPage ? (
        <p className="text-xs text-muted-foreground">No more topics</p>
      ) : null}
    </div>
  );
}
