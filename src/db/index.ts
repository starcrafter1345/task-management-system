import { PrismaClient } from "@prisma/client";
import { getTaskStatus } from "../utils/utils";

export const prisma = new PrismaClient().$extends({
  result: {
    task: {
      status: {
        needs: { dueDate: true, completed: true },
        compute(task) {
          return getTaskStatus(task.dueDate, task.completed);
        },
      },
    },
  },
});
