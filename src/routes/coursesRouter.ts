import { Router } from "express";
import coursesController from "../controllers/coursesController";
import { courseParser } from "../utils/parsers";

const coursesRouter = Router();

coursesRouter
  .route("/courses")
  .get(coursesController.getAllCourses)
  .post(courseParser, coursesController.createCourse);

coursesRouter
  .route("/courses/:id")
  .delete(coursesController.deleteCourse)
  .put(courseParser, coursesController.changeCourse);

export default coursesRouter;
