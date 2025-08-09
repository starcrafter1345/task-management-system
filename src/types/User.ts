import z from "zod";
import { Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{}>;

export type SafeUser = Prisma.UserGetPayload<{
  omit: {
    hashedPassword: true;
  };
}>;

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
