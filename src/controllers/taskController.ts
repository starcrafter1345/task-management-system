import { NextFunction, Request, Response } from "express";
import { Task, TaskFormEntry } from "../types/Task";
import { courses } from "./coursesController";

const tasks: Task[] = [];

const getAllTasks = (_req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const userTasks = tasks.filter((t) => t.userId === user.id);

  res.status(200).json(userTasks);
};

const createTask = (
  req: Request<unknown, unknown, TaskFormEntry>,
  res: Response<Task>,
  next: NextFunction,
) => {
  const task = req.body;
  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const course = courses.find((c) => c.id === task.courseId);

  if (!course) {
    const error = new Error("Course not found");
    error.name = "Not Found";
    next(error);
    return;
  }

  const taskId = (tasks.at(-1)?.id ?? 0) + 1;

  const newTask: Task = {
    userId: user.id,
    id: taskId,
    title: task.title,
    description: task.description ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    course: {
      id: course.id,
      name: course.name,
      code: course.code,
      color: course.color,
    },
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
};

const deleteTask = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  const id = req.params.id;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const taskIndex = tasks.findIndex((t) => t.id === Number(id));

  tasks.splice(taskIndex, 1);

  if (taskIndex === -1) {
    const error = new Error("Not Found");
    error.name = "Not Found";
    next(error);
    return;
  }

  res.sendStatus(204);
};

export default { createTask, getAllTasks, deleteTask };
