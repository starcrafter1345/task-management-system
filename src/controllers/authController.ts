import { Request, Response } from "express";
import env from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { RegisterFormEntry, User } from "../types";

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

export default {
	register
};