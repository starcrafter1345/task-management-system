import { Router, Request, Response, NextFunction } from "express";
import { TaskFormSchema } from "../types/Task";
import taskController from "../controllers/taskController";

const tasksRouter = Router();

const taskParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    TaskFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};

tasksRouter
  .route("/tasks")
  .get(taskController.getAllTasks)
  .post(taskParser, taskController.createTask);
//
tasksRouter
  .route("/tasks/:id")
  .put(taskController.changeTask)
  .delete(taskController.deleteTask);
//
// tasksRouter.patch("/tasks/:id/toggle");

export default tasksRouter;
