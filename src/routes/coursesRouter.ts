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

coursesRouter.route("/courses")
	.get(coursesController.getAll)
	.post(courseParser, coursesController.create);

// coursesRouter.route("/courses/:id")
// 	.put()
// 	.delete();

export default coursesRouter;