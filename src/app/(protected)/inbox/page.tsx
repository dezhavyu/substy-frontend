import { InboxList } from "@/features/inbox/components/inbox-list";
import { PageContainer } from "@/shared/ui/page-container";

export default function InboxPage(): JSX.Element {
  return (
    <PageContainer title="Inbox" description="Cursor-paginated history of delivered notifications.">
      <InboxList />
    </PageContainer>
  );
}
