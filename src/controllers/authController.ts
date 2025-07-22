import { NextFunction, Request, Response } from "express";
import env from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { LoginFormEntry, RegisterFormEntry, ResponseUser, User } from "../types";

const users: User[] = [];

const register = async (req: Request<unknown, unknown, RegisterFormEntry>, res: Response) => {
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

  const token = jwt.sign({ userId }, env.privateKey, { expiresIn: "1d" });

  res.status(200).json(token);
};

const login = async (req: Request<unknown, unknown, LoginFormEntry>, res: Response<string>, next: NextFunction) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    next(new Error("Not Found"));
    return;
  }

  if (await bcrypt.compare(password, user.hashedPassword)) {
    const token = jwt.sign({ userId: user.id }, env.privateKey, { expiresIn: "1d" });
    res.status(200).json(token);
  } else {
    next(new Error("Unauthorized"));
  }
};

const logout = (req: Request, res: Response) => {

};

export default {
	register,
  login
};