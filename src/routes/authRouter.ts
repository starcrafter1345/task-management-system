import { Router, Request, Response, NextFunction } from "express";
import authController from "../controllers/authController";
import { RegisterFormSchema } from "../types";

const authRouter = Router();

const registerParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    RegisterFormSchema.parse(req.body);
    next();
  } catch (err: unknown) {
    next(err);
  }
};

// authRouter.get("/me");

authRouter.post("/register", registerParser, authController.register);
// authRouter.post("/login");
// authRouter.post("/logout");

export default authRouter;