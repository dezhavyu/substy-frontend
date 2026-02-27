import { z } from "zod";

const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const channelSchema = z.enum(["email", "push", "web"]);

export const preferencesSchema = z.object({
  channels: z.array(channelSchema).min(1, "Choose at least one channel"),
  quiet_hours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(hhmmRegex, "Use HH:mm format"),
    end: z.string().regex(hhmmRegex, "Use HH:mm format")
  }),
  timezone: z.string().min(1, "Timezone is required").refine(isValidTimeZone, "Invalid IANA timezone")
});

export type Preferences = z.infer<typeof preferencesSchema>;

export const preferencesFormSchema = preferencesSchema;

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
