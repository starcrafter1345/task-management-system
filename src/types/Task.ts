import z from "zod";

export interface Task {
  userId: number;
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  course: {
    id: number;
    name: string;
    code: string;
    color: string;
  };
}

export const TaskFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  courseId: z.number(),
});

export type TaskFormEntry = z.infer<typeof TaskFormSchema>;
