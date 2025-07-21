import { Router } from "express";

const authRouter = Router();

authRouter.get("/me");

authRouter.post("/register");
authRouter.post("/login");
authRouter.post("/logout");

export default authRouter;