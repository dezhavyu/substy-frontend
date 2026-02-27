import { z } from "zod";

export const roleSchema = z.enum(["user", "admin"]);

const rawUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullish(),
  role: roleSchema.optional()
});

export const userSchema = rawUserSchema.transform((value) => ({
  id: value.id,
  email: value.email,
  name: value.name ?? undefined,
  role: value.role ?? "user"
}));

export type User = z.infer<typeof userSchema>;

export const registerResponseSchema = z.object({
  status: z.enum(["created", "ok"]),
  message: z.string()
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

const authActionObjectSchema = z
  .object({
    user: userSchema.optional()
  })
  .passthrough();

export const authActionResponseSchema = z
  .union([z.undefined(), authActionObjectSchema])
  .transform((value) => ({
    user: value?.user
  }));

export type AuthActionResponse = z.infer<typeof authActionResponseSchema>;

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must contain at least 8 characters")
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(12, "Password must contain at least 12 characters"),
    confirmPassword: z.string().min(12, "Password confirmation is required")
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match"
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
