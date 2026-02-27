import { z } from "zod";
import { apiRequest } from "@/shared/api/client";
import { Preferences, preferencesSchema } from "@/features/preferences/schemas";

const channelSchema = z.enum(["email", "push", "web"]);
const subscriptionSchema = z.object({
  id: z.string(),
  topic_id: z.string(),
  is_active: z.boolean(),
  preferences: z.object({
    channels: z.array(channelSchema),
    quiet_hours: z
      .object({
        start: z.string(),
        end: z.string()
      })
      .nullable(),
    timezone: z.string()
  })
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

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

function defaultPreferences(): Preferences {
  return {
    channels: ["web"],
    quiet_hours: {
      enabled: false,
      start: "00:00",
      end: "00:00"
    },
    timezone: "UTC"
  };
}

function subscriptionToPreferences(subscription: Subscription): Preferences {
  const quietHours = subscription.preferences.quiet_hours;

  return preferencesSchema.parse({
    channels: subscription.preferences.channels,
    quiet_hours: {
      enabled: quietHours !== null,
      start: quietHours ? normalizeTime(quietHours.start) : "00:00",
      end: quietHours ? normalizeTime(quietHours.end) : "00:00"
    },
    timezone: subscription.preferences.timezone
  });
}

function preferencesToPatch(payload: Preferences): Record<string, unknown> {
  const quietHours = payload.quiet_hours.enabled
    ? {
        start: payload.quiet_hours.start,
        end: payload.quiet_hours.end
      }
    : {
        start: "00:00",
        end: "00:00"
      };

  return {
    preferences: {
      channels: payload.channels,
      quiet_hours: quietHours,
      timezone: payload.timezone
    }
  };
}

async function listAllActiveSubscriptions(): Promise<Subscription[]> {
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

    subscriptions.push(...page.items.filter((item) => item.is_active));
    cursor = page.nextCursor;
  } while (cursor);

  return subscriptions;
}

export async function getPreferences(): Promise<Preferences> {
  const subscriptions = await listAllActiveSubscriptions();
  const target = subscriptions[0];

  if (!target) {
    return defaultPreferences();
  }

  return subscriptionToPreferences(target);
}

export async function updatePreferences(payload: Preferences): Promise<Preferences> {
  const parsedPayload = preferencesSchema.parse(payload);
  const subscriptions = await listAllActiveSubscriptions();

  if (subscriptions.length === 0) {
    return parsedPayload;
  }

  const patchBody = preferencesToPatch(parsedPayload);

  await Promise.all(
    subscriptions.map((subscription) =>
      apiRequest({
        path: `/api/subscriptions/${subscription.id}`,
        method: "PATCH",
        body: patchBody,
        responseSchema: subscriptionSchema
      })
    )
  );

  return parsedPayload;
}
