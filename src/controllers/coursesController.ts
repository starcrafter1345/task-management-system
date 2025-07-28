import { NextFunction, Request, Response } from "express";

import { Course, CourseFormEntry, ResponseCourse } from "../types/Course";

const courses: Course[] = [];

const getAllCourses = (_req: Request, res: Response<ResponseCourse[]>, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const userCourses = courses.filter(c => c.user_id === user.id);
  const responseCourses: ResponseCourse[] = userCourses.map(c => ({ name: c.name, color: c.color, code: c.code }));

  res.status(200).json(responseCourses);
};

const createCourse = (req: Request<unknown, unknown, CourseFormEntry>, res: Response<ResponseCourse>, next: NextFunction) => {
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
    created_at: new Date
  };

  courses.push(newCourse);

  res.status(201).json({
    name: newCourse.name,
    code: newCourse.code,
    color: newCourse.color,
  });
};

const changeCourse = (req: Request<unknown, unknown, CourseFormEntry>, res: Response<ResponseCourse>, next: NextFunction) => {
  const changingCourse = req.body;
  const user = res.locals.user;
  const id = req.params.id;

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
    return;
  }

  const courseIndex = courses.findIndex(c => c.id === Number(id));

  courses[courseIndex] = {
    ...courses[courseIndex],
    name: changingCourse.name,
    code: changingCourse.code,
    color: changingCourse.color
  };

  res.status(200).json(changingCourse)
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

  const courseIndex = courses.findIndex(c => c.id === Number(id));

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
  changeCourse
};