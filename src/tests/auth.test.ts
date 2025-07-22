import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index";

const user = {
  name: "starc",
  email: "starc@mail.com",
  password: "secret",
};

describe("/auth", () => {
  it("POST /register", async () => {
    const response = await request(app).post("/api/auth/register").send(user);

    expect(response.status).toBe(200);
    expect(response.body.token).not.toBeNull();
  });

  it("POST /login", async () => {
    const register = await request(app).post("/api/auth/register").send(user);
    const token = register.body;

    const response = await request(app).post("/api/auth/login").send({ token });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: "starc",
      email: "starc@mail.com"
    });
  });

  it("POST /login, malformatted token", async () => {
    const register = await request(app).post("/api/auth/register").send(user);
    const token = register.body;

    const response = await request(app).post("/api/auth/login").send({ token });


  });
});