import { NextFunction, Request, Response } from "express";
import env from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { CookieRequest, ResponseToken } from "../types/types";
import { LoginFormEntry, RegisterFormEntry, ResponseUser, User } from "../types/User";

export const users: User[] = [];
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

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24*60*60*1000 // 24h
  });

  res.status(200).json({ access_token: accessToken });
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

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24*60*60*1000 // 24h
    });

    res.status(200).json({ access_token: accessToken });
  } else {
    const error = new Error("Unauthorized");
    error.name = "Unauthorized";
    next(error);
  }
};

const logout = (req: CookieRequest, res: Response) => {
  const token = req.cookies.refresh_token;

  if (token) {
    tokenBlacklist.add(token);
    res.status(200).json({ message: "Logged Out" });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

const me = (_req: Request, res: Response) => {
  if (!res.locals.user) {
    throw new Error("Internal Error");
  }

  const { name, email, createdAt } = res.locals.user;

  const responseUser: ResponseUser = {
    name, email, createdAt
  };

  res.status(200).json(responseUser);
};

export default {
	register,
  login,
  logout,
  me
};