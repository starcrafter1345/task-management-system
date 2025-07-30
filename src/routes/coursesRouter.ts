import { Router, Request, Response, NextFunction } from "express";
import coursesController from "../controllers/coursesController";
import { CourseFormSchema } from "../types/Course";
import { authMiddleware } from "../middlewares/authMiddleware";

const coursesRouter = Router();

const courseParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    CourseFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};

coursesRouter.use(authMiddleware);

coursesRouter
  .route("/courses")
  .get(coursesController.getAllCourses)
  .post(courseParser, coursesController.createCourse);

coursesRouter
  .route("/courses/:id")
  .delete(coursesController.deleteCourse)
  .put(courseParser, coursesController.changeCourse);

export default coursesRouter;
