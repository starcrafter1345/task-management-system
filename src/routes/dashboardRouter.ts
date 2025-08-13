import { Router } from "express";
import dashboardController from "../controllers/dashboardController";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard", dashboardController.getDashboard);

export default dashboardRouter;
