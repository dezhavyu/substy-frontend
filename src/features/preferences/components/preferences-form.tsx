"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/shared/api/errors";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  channelSchema,
  preferencesFormSchema,
  PreferencesFormValues
} from "@/features/preferences/schemas";
import { usePreferencesQuery, useUpdatePreferencesMutation } from "@/features/preferences/hooks";

const channels = channelSchema.options;

function getDefaultValues(): PreferencesFormValues {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    channels: ["web"],
    quiet_hours: {
      enabled: false,
      start: "00:00",
      end: "00:00"
    },
    timezone
  };
}

export function PreferencesForm(): JSX.Element {
  const preferencesQuery = usePreferencesQuery();
  const updateMutation = useUpdatePreferencesMutation();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    if (preferencesQuery.data) {
      form.reset(preferencesQuery.data);
    }
  }, [form, preferencesQuery.data]);

  const selectedChannels = form.watch("channels");

  const toggleChannel = (channel: (typeof channels)[number], checked: boolean): void => {
    const current = form.getValues("channels");

    if (checked && !current.includes(channel)) {
      form.setValue("channels", [...current, channel], { shouldValidate: true });
      return;
    }

    if (!checked) {
      form.setValue(
        "channels",
        current.filter((value) => value !== channel),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Preferences saved");
      },
      onError: (error) => {
        const message = error instanceof ApiError ? error.message : "Failed to save preferences";
        toast.error(message);
      }
    });
  });

  if (preferencesQuery.isPending) {
    return <Alert title="Loading preferences..." />;
  }

  if (preferencesQuery.isError) {
    return <Alert variant="error" title="Failed to load preferences" description={preferencesQuery.error.message} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Configure channels, quiet hours and timezone.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} data-testid="preferences-form">
          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-3">
              {channels.map((channel) => (
                <label key={channel} className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm">
                  <Checkbox
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={(value) => toggleChannel(channel, value === true)}
                  />
                  {channel}
                </label>
              ))}
            </div>
            {form.formState.errors.channels ? (
              <p className="text-xs text-destructive">{form.formState.errors.channels.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.watch("quiet_hours.enabled")}
                onCheckedChange={(checked) => form.setValue("quiet_hours.enabled", checked === true)}
              />
              Quiet hours enabled
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">Quiet start</Label>
              <Input id="quiet-start" type="time" {...form.register("quiet_hours.start")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-end">Quiet end</Label>
              <Input id="quiet-end" type="time" {...form.register("quiet_hours.end")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" placeholder="Europe/Berlin" {...form.register("timezone")} />
            {form.formState.errors.timezone ? (
              <p className="text-xs text-destructive">{form.formState.errors.timezone.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={updateMutation.isPending} data-testid="preferences-save">
            {updateMutation.isPending ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
