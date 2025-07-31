import { NextFunction, Request, Response } from "express";

import { Course, CourseFormEntry } from "../types/Course";

export const courses: Course[] = [];

const getAllCourses = (
  _req: Request,
  res: Response<Course[]>,
  next: NextFunction,
) => {
  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const userCourses = courses.filter((c) => c.user_id === user.id);

  res.status(200).json(userCourses);
};

const createCourse = (
  req: Request<unknown, unknown, CourseFormEntry>,
  res: Response<Course>,
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

  const courseId = (courses.at(-1)?.id ?? 0) + 1;

  const newCourse: Course = {
    id: courseId,
    user_id: user.id,
    code: courseEntry.code,
    name: courseEntry.name,
    color: courseEntry.color,
    created_at: new Date().toISOString(),
  };

  courses.push(newCourse);

  res.status(201).json(newCourse);
};

const changeCourse = (
  req: Request<unknown, unknown, CourseFormEntry>,
  res: Response<Course>,
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

  const courseIndex = courses.findIndex((c) => c.id === Number(id));

  const changedCourse = {
    ...courses[courseIndex],
    name: changingCourse.name,
    code: changingCourse.code,
    color: changingCourse.color,
  };

  courses[courseIndex] = changedCourse;

  res.status(200).json(changedCourse);
};

const deleteCourse = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  const id = req.params.id;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const courseIndex = courses.findIndex((c) => c.id === Number(id));

  if (courseIndex === -1) {
    const error = new Error("Not Found");
    error.name = "Not Found";
    next(error);
    return;
  }

  courses.splice(courseIndex, 1);

  res.sendStatus(204);
};

export default {
  getAllCourses,
  createCourse,
  deleteCourse,
  changeCourse,
};
