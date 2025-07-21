import { Router } from "express";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard/stats");

export default dashboardRouter;