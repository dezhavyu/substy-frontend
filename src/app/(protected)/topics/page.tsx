import { TopicsFeed } from "@/features/topics/components/topics-feed";
import { PageContainer } from "@/shared/ui/page-container";

export default function TopicsPage(): JSX.Element {
  return (
    <PageContainer
      title="Topics"
      description="Discover topics and manage subscriptions with optimistic interactions."
    >
      <TopicsFeed />
    </PageContainer>
  );
}
