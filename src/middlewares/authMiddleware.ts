import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { users } from "../controllers/authController";
import env from "../config/env";

interface DecodedToken {
  userId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, env.privateKey) as DecodedToken;

    if (!decodedToken.userId) {
      const err = new Error("Malformed Token");
      err.name = "Malformed Token";
      next(err);
      return;
    }

    const user = users.find(
      (u) => Number(u.id) === Number(decodedToken.userId),
    );

    if (!user) {
      const err = new Error("Forbidden");
      err.name = "Forbidden";
      next(err);
      return;
    }

    res.locals.user = user;
    next();
  } else {
    const err = new Error("Unauthorized");
    err.name = "Unauthorized";
    next(err);
  }
};
