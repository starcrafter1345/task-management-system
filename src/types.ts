import z from "zod";

export interface User {
  id: number;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
}

export const RegisterFormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string()
});

export type RegisterFormEntry = z.infer<typeof RegisterFormSchema>;
