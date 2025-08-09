import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { prisma } from "../db";

interface DecodedToken {
  userId: string;
}

export const authMiddleware = async (
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

    let user;

    try {
      user = await prisma.user.findUnique({
        where: {
          id: Number(decodedToken.userId),
        },
        omit: {
          hashedPassword: true,
        },
      });
    } catch (err) {
      next(err);
    }

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
