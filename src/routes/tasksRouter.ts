import { Router } from "express";
import taskController from "../controllers/taskController";
import { taskParser, taskToggleParser } from "../utils/parsers";

const tasksRouter = Router();

tasksRouter
  .route("/tasks")
  .get(taskController.getAllTasks)
  .post(taskParser, taskController.createTask);

tasksRouter
  .route("/tasks/:id")
  .put(taskController.changeTask)
  .delete(taskController.deleteTask);

tasksRouter.patch(
  "/tasks/:id/toggle",
  taskToggleParser,
  taskController.toggleTaskComplete,
);

export default tasksRouter;
