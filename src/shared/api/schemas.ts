import { z } from "zod";

export const bffErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  request_id: z.string().optional()
});

export const unknownObjectSchema = z.record(z.string(), z.unknown());
