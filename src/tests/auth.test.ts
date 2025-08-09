import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { agent } from "supertest";
import { app } from "../index";
import { prisma } from "../db";
import { RegisterFormEntry } from "../types/User";

const request = agent(app);

const userEntry: RegisterFormEntry = {
  name: "starc",
  email: "starc@mail.com",
  password: "secret",
};

let refreshToken: string;
let accessToken: string;

describe("/auth", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.task.deleteMany();
  });

  it("/register", async () => {
    const register = await request.post("/api/auth/register").send(userEntry);

    expect(register.status).toBe(201);
    expect(register.headers["set-cookie"]).toBeDefined();
    expect(register.body).toMatchObject({
      access_token: expect.any(String) as string,
      user: {
        id: expect.any(Number) as number,
        name: userEntry.name,
        email: userEntry.email,
        created_at: expect.any(String) as string,
      },
    });

    refreshToken = register.headers["set-cookie"];
    accessToken = register.body.access_token as string;
  });

  it("/register, making same user should return uniqueness error", async () => {
    const register = await request.post("/api/auth/register").send(userEntry);

    expect(register.status).toBe(400);
    expect(register.body).toEqual({
      error: "Bad Request",
      cause: "Email must be unique",
    });
  });

  it("/login", async () => {
    const login = await request
      .post("/api/auth/login")
      .send({ email: userEntry.email, password: userEntry.password });

    expect(login.status).toBe(200);
    expect(login.headers["set-cookie"]).toBeDefined();
    expect(login.body).toMatchObject({
      access_token: expect.any(String) as string,
      user: {
        id: expect.any(Number) as number,
        name: userEntry.name,
        email: userEntry.email,
        created_at: expect.any(String) as string,
      },
    });
  });

  it("/login, wrong email", async () => {
    const login = await request.post("/api/auth/login").send({
      email: "wrongemail@mail.com",
      password: "wrongpassword",
    });

    expect(login.status).toBe(404);
    expect(login.body).toEqual({
      error: "Not Found",
    });
  });

  it("/login, wrong password", async () => {
    const login = await request.post("/api/auth/login").send({
      email: userEntry.email,
      password: "wrongpassword",
    });

    expect(login.status).toBe(401);
    expect(login.body).toEqual({
      error: "Unauthorized",
    });
  });

  it("/logout", async () => {
    const logout = await request
      .post("/api/auth/logout")
      .set("Cookie", refreshToken);

    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({ message: "Logged Out" });
  });

  it("/me", async () => {
    const me = await request
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({
      id: expect.any(Number) as number,
      name: userEntry.name,
      email: userEntry.email,
      created_at: expect.any(String) as string,
    });
  });
});
