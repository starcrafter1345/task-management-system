import { NextFunction, Request, Response } from "express";

import { Course, CourseFormEntry } from "../types/Course";
import { prisma } from "../db";
import { IdParams } from "../types/types";

export const courses: Course[] = [];

const getAllCourses = async (
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

  const userCourses = await prisma.course.findMany({
    where: {
      userId: user.id,
    },
  });

  res.status(200).json(userCourses);
};

const createCourse = async (
  req: Request<unknown, unknown, CourseFormEntry>,
  res: Response,
  next: NextFunction,
) => {
  const user = res.locals.user;
  const courseEntry = req.body;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const newCourse = await prisma.course.create({
    data: {
      name: courseEntry.name,
      code: courseEntry.code,
      color: courseEntry.color,
      user: {
        connect: { id: user.id },
      },
    },
    include: {
      user: true,
    },
  });

  res.status(201).json(newCourse);
};

const changeCourse = async (
  req: Request<IdParams, unknown, CourseFormEntry>,
  res: Response,
  next: NextFunction,
) => {
  const changingCourse = req.body;
  const user = res.locals.user;
  const id = req.params.id;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const changedCourse = await prisma.course.update({
    where: {
      id: Number(id),
    },
    data: {
      ...changingCourse,
    },
  });

  res.status(200).json(changedCourse);
};

const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = res.locals.user;
  const id = req.params.id;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  await prisma.course.delete({
    where: {
      id: Number(id),
    },
  });

  res.sendStatus(204);
};

export default {
  getAllCourses,
  createCourse,
  deleteCourse,
  changeCourse,
};
