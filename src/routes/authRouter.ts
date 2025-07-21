import { Router } from "express";
import authController from "../controllers/authController";

const authRouter = Router();

// authRouter.get("/me");

authRouter.post("/register", authController.register);
// authRouter.post("/login");
// authRouter.post("/logout");

export default authRouter;