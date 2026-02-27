"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/shared/api/errors";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  adminNotificationFormSchema,
  AdminNotificationFormValues,
  createNotificationRequestSchema
} from "@/features/notifications/schemas";
import { useCreateNotificationMutation } from "@/features/notifications/hooks";

export function AdminNotificationForm(): JSX.Element {
  const createMutation = useCreateNotificationMutation();

  const form = useForm<AdminNotificationFormValues>({
    resolver: zodResolver(adminNotificationFormSchema),
    defaultValues: {
      topic_id: "",
      message: "",
      scheduled_at: ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    const normalizedScheduledAt = values.scheduled_at && values.scheduled_at.length > 0 ? values.scheduled_at : undefined;

    const payload = createNotificationRequestSchema.parse({
      topic_id: values.topic_id,
      message: values.message,
      scheduled_at: normalizedScheduledAt
    });

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Notification request created");
        form.reset({
          topic_id: "",
          message: "",
          scheduled_at: ""
        });
      },
      onError: (error) => {
        const message = error instanceof ApiError ? error.message : "Failed to create notification";
        toast.error(message);
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin notification dispatch</CardTitle>
        <CardDescription>Send notification command with optional scheduling.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} data-testid="admin-notification-form">
          <div className="space-y-2">
            <Label htmlFor="topic-id">Topic ID</Label>
            <Input id="topic-id" {...form.register("topic_id")} />
            {form.formState.errors.topic_id ? (
              <p className="text-xs text-destructive">{form.formState.errors.topic_id.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" {...form.register("message")} />
            {form.formState.errors.message ? (
              <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-at">scheduled_at (ISO)</Label>
            <Input id="scheduled-at" placeholder="2026-02-27T18:30:00+00:00" {...form.register("scheduled_at")} />
            {form.formState.errors.scheduled_at ? (
              <p className="text-xs text-destructive">{form.formState.errors.scheduled_at.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={createMutation.isPending} data-testid="admin-notification-submit">
            {createMutation.isPending ? "Sending..." : "Create notification command"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
