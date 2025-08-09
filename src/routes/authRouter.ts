import { Router } from "express";
import authController from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { loginParser, registerParser } from "../utils/parsers";

const authRouter = Router();

authRouter.get("/me", authMiddleware, authController.me);

authRouter.post("/register", registerParser, authController.register);
authRouter.post("/login", loginParser, authController.login);
authRouter.post("/logout", authController.logout);

export default authRouter;
