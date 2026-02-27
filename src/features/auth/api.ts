import { z } from "zod";
import { apiRequest } from "@/shared/api/client";
import {
  authActionResponseSchema,
  registerResponseSchema,
  RegisterResponse,
  User,
  userSchema
} from "@/features/auth/schemas";
import { clearAccessToken, setAccessToken } from "@/shared/lib/access-token";

const passthroughResponseSchema = z.union([z.undefined(), z.object({}).passthrough()]);
const loginResponseSchema = z.object({
  access_token: z.string().min(1)
}).passthrough();

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest({
    path: "/api/auth/register",
    method: "POST",
    body: request,
    requiresAuth: false,
    responseSchema: registerResponseSchema
  });
}

export async function login(request: LoginRequest) {
  const response = await apiRequest({
    path: "/api/auth/login",
    method: "POST",
    body: request,
    requiresAuth: false,
    responseSchema: loginResponseSchema
  });

  setAccessToken(response.access_token);
  return authActionResponseSchema.parse(undefined);
}

export async function logout(): Promise<void> {
  await apiRequest({
    path: "/api/auth/logout",
    method: "POST",
    requiresAuth: false,
    responseSchema: passthroughResponseSchema
  });
  clearAccessToken();
}

export async function getMe(): Promise<User> {
  return apiRequest({
    path: "/api/me",
    method: "GET",
    responseSchema: userSchema
  });
}
