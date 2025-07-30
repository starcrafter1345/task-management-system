import z from "zod";

export interface User {
  id: number;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: string;
}

export type ResponseUser = Omit<User, "hashedPassword">;

export const RegisterFormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string(),
});

export type RegisterFormEntry = z.infer<typeof RegisterFormSchema>;

export const LoginFormSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginFormEntry = z.infer<typeof LoginFormSchema>;
