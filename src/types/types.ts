import { Request } from "express";
import z from "zod";

export interface User {
  id: number;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
}

export type ResponseUser = Omit<User, "id" | "hashedPassword">;

export interface Course {
  id: number;
  user_id: number;
  name: string;
  code: string;
  color: string;
  created_at: Date;
}

export interface ResponseToken {
  access_token: string;
}

export interface CookieRequest extends Request {
  cookies: {
    refresh_token?: string;
  }
}

export const RegisterFormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string()
});

export type RegisterFormEntry = z.infer<typeof RegisterFormSchema>;

export const LoginFormSchema = z.object({
  email: z.email(),
  password: z.string()
});

export type LoginFormEntry = z.infer<typeof LoginFormSchema>;