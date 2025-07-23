import { NextFunction, Request, Response } from "express";
import env from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { LoginFormEntry, RegisterFormEntry, ResponseToken, User } from "../types";

const users: User[] = [];
const tokenBlacklist: Set<string> = new Set<string>();

const register = async (req: Request<unknown, unknown, RegisterFormEntry>, res: Response<ResponseToken>) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = (users.at(-1)?.id ?? 0) + 1;

  users.push({
    name,
    email,
    hashedPassword,
    id: userId,
    createdAt: new Date()
  });

  const accessToken = jwt.sign({ userId, type: "access" }, env.privateKey, { expiresIn: "2h" });
  const refreshToken = jwt.sign({ userId, type: "refresh" }, env.refreshKey, { expiresIn: "1d" });

  res.status(200).json({ access_token: accessToken, refresh_token: refreshToken });
};

const login = async (req: Request<unknown, unknown, LoginFormEntry>, res: Response<ResponseToken>, next: NextFunction) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    const error = new Error("Not Found");
    error.name = "Not Found";
    next(error);
    return;
  }

  if (await bcrypt.compare(password, user.hashedPassword)) {
    const accessToken = jwt.sign({ user: user.id, type: "access" }, env.privateKey, { expiresIn: "2h" });
    const refreshToken = jwt.sign({ user: user.id, type: "refresh" }, env.refreshKey, { expiresIn: "1d" });
    res.status(200).json({ access_token: accessToken, refresh_token: refreshToken });
  } else {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
  }
};

const logout = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    tokenBlacklist.add(token);
  }

  res.status(200).json({ message: "Logged Out" });
};

export default {
	register,
  login,
  logout
};