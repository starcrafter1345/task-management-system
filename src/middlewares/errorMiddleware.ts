import { Request, Response } from "express";

export const errorMiddleware = (err: Error, _req: Request, res: Response) => {
  switch (err.name) {
    case "JsonWebTokenError":
      case "Unauthorized":
      res.status(401).json({
        error: "Unauthorized",
      });
      break;
    case "Not Found":
      res.status(404).json({
        error: "Not Found"
      });
      break;
    default:
      res.status(500).json({
        error: "Server Error",
      });
      break;
  }
};