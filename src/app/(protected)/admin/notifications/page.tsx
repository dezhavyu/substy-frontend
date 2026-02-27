"use client";

import { useMeQuery } from "@/features/auth/hooks";
import { AdminNotificationForm } from "@/features/notifications/components/admin-notification-form";
import { Alert } from "@/shared/ui/alert";
import { PageContainer } from "@/shared/ui/page-container";
import { Spinner } from "@/shared/ui/spinner";

export default function AdminNotificationsPage(): JSX.Element {
  const meQuery = useMeQuery();

  if (meQuery.isPending) {
    return <Spinner label="Checking permissions..." />;
  }

  if (meQuery.isError || !meQuery.data) {
    return <Alert variant="error" title="Cannot verify role" description="Please reload the page." />;
  }

  if (meQuery.data.role !== "admin") {
    return <Alert variant="error" title="Access denied" description="Admin role is required for this page." />;
  }

  return (
    <PageContainer
      title="Admin notifications"
      description="Create scheduled notification commands with idempotency protection."
    >
      <AdminNotificationForm />
    </PageContainer>
  );
}
