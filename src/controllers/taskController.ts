import { NextFunction, Request, Response } from "express";
import { TaskFormEntry, TaskToggleEntry } from "../types/Task";
import { prisma } from "../db";
import { IdParams } from "../types/types";
import { Prisma } from "@prisma/client";
import { getTaskStatus } from "../utils/utils";

const getAllTasks = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const userTasks = await prisma.task.findMany({
    where: {
      course: {
        userId: user.id,
      },
    },
    include: {
      course: {
        omit: {
          createdAt: true,
          userId: true,
        },
      },
    },
  });

  const userTasksWithStatus = userTasks.map((t) => ({
    ...t,
    isOverdue: t.dueDate ? new Date() > new Date(t.dueDate) : false,
    status: getTaskStatus(t.dueDate, t.completed),
  }));

  res.status(200).json(userTasksWithStatus);
};

const createTask = async (
  req: Request<unknown, unknown, TaskFormEntry>,
  res: Response,
  next: NextFunction,
) => {
  const { title, description, courseId, dueDate } = req.body;
  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      courseId: courseId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
          code: true,
        },
      },
    },
  });

  res.status(201).json(newTask);
};

const changeTask = async (
  req: Request<IdParams, unknown, TaskFormEntry>,
  res: Response,
  next: NextFunction,
) => {
  const changingTask = req.body;
  const id = req.params.id;

  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  let changedTask;

  try {
    await prisma.task.findUniqueOrThrow({
      where: {
        id: Number(id),
        course: {
          userId: user.id,
        },
      },
    });

    changedTask = await prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        title: changingTask.title,
        description: changingTask.description ?? null,
        dueDate: changingTask.dueDate ?? null,
      },
      include: {
        course: {
          omit: {
            userId: true,
            createdAt: true,
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json(changedTask);
};

const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  const id = req.params.id;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  try {
    await prisma.task.findUniqueOrThrow({
      where: {
        id: Number(id),
        course: {
          userId: user.id,
        },
      },
    });

    await prisma.task.delete({
      where: {
        id: Number(id),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      next(err);
    }

    next(err);
    return;
  }

  res.sendStatus(204);
};

const toggleTaskComplete = async (
  req: Request<IdParams, unknown, TaskToggleEntry>,
  res: Response,
  next: NextFunction,
) => {
  const completed = req.body.completed;
  const id = req.params.id;

  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  await prisma.task.update({
    where: {
      id: Number(id),
    },
    data: {
      completed,
    },
  });

  res.sendStatus(200);
};

export default {
  createTask,
  getAllTasks,
  deleteTask,
  changeTask,
  toggleTaskComplete,
};
