import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  switch (err.name) {
    case "ZodError":
      res.status(400).json({
        error: "Bad request",
      });
      break;
    case "JsonWebTokenError":
    case "Unauthorized":
      res.status(401).json({
        error: "Unauthorized",
      });
      break;
    case "Not Found":
      res.status(404).json({
        error: "Not Found",
      });
      break;
    default:
      res.status(500).json({
        error: "Server Error",
        err,
      });
      break;
  }
};
