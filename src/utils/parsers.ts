import { NextFunction, Request, Response } from "express";
import { LoginFormSchema, RegisterFormSchema } from "../types/User";
import { CourseFormSchema } from "../types/Course";
import { TaskFormSchema, TaskToggleSchema } from "../types/Task";

export const registerParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    RegisterFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};
export const loginParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    LoginFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};
export const courseParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    CourseFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};
export const taskParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    TaskFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};

export const taskToggleParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    TaskToggleSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};
