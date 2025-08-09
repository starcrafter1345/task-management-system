import { NextFunction, Request, Response } from "express";
import env from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { CookieRequest } from "../types/types";
import { LoginFormEntry, RegisterFormEntry, SafeUser } from "../types/User";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";

const tokenBlacklist: Set<string> = new Set<string>();

const register = async (
  req: Request<unknown, unknown, RegisterFormEntry>,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  let user: SafeUser;

  try {
    user = await prisma.user.create({
      data: { name, email, hashedPassword },
      omit: { hashedPassword: true },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const err = new Error("Email must be unique");
        err.name = "Bad Request";
        next(err);
        return;
      }
    }

    next(err);
    return;
  }

  const accessToken = jwt.sign(
    { userId: user.id, type: "access" },
    env.privateKey,
    {
      expiresIn: "2h",
    },
  );
  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh" },
    env.refreshKey,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });

  res.status(201).json({ access_token: accessToken, user });
};

const login = async (
  req: Request<unknown, unknown, LoginFormEntry>,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.name = "Not Found";
    next(error);
    return;
  }

  if (await bcrypt.compare(password, user.hashedPassword)) {
    const accessToken = jwt.sign(
      { userId: user.id, type: "access" },
      env.privateKey,
      { expiresIn: "2h" },
    );
    const refreshToken = jwt.sign(
      { userId: user.id, type: "refresh" },
      env.refreshKey,
      { expiresIn: "1d" },
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });

    res.status(200).json({ access_token: accessToken, user });
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

const me = (_req: Request, res: Response<SafeUser>) => {
  if (!res.locals.user) {
    throw new Error("Internal Error");
  }

  const user = res.locals.user;

  res.status(200).json(user);
};

export default {
  register,
  login,
  logout,
  me,
};
