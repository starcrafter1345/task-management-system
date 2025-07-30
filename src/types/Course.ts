import z from "zod";

export interface Course {
  id: number;
  user_id: number;
  name: string;
  code: string;
  color: string;
  created_at: string;
}

const htmlColorInputSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, {
  message:
    "Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).",
});

export const CourseFormSchema = z.object({
  name: z.string().min(2),
  code: z.string(),
  color: htmlColorInputSchema,
});

export type CourseFormEntry = z.infer<typeof CourseFormSchema>;
