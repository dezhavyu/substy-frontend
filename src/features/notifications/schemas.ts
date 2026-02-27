import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const adminNotificationFormSchema = z.object({
  topic_id: z.string().min(1, "Topic ID is required"),
  message: z.string().trim().min(3, "Message is too short").max(1000, "Message is too long"),
  scheduled_at: z.union([z.literal(""), isoDateTimeSchema]).optional()
});

export type AdminNotificationFormValues = z.infer<typeof adminNotificationFormSchema>;

export const createNotificationRequestSchema = z.object({
  topic_id: z.string().min(1),
  message: z.string().min(3).max(1000),
  scheduled_at: isoDateTimeSchema.optional()
});

export type CreateNotificationRequest = z.infer<typeof createNotificationRequestSchema>;

export const createNotificationResponseSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  scheduled_at: z.string().datetime({ offset: true }).optional()
});

export type CreateNotificationResponse = z.infer<typeof createNotificationResponseSchema>;
