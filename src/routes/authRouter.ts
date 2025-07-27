import { Router, Request, Response, NextFunction } from "express";
import authController from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { LoginFormSchema, RegisterFormSchema } from "../types/User";

const authRouter = Router();

const registerParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    RegisterFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};

const loginParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    LoginFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};

authRouter.get("/me", authMiddleware, authController.me);

authRouter.post("/register", registerParser, authController.register);
authRouter.post("/login", loginParser, authController.login);
authRouter.post("/logout", authController.logout);

export default authRouter;