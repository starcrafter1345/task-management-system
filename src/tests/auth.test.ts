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
    expect(response.body.access_token).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("POST /login", async () => {
    await request(app).post("/api/auth/register").send(user);
    const { email, password } = user;

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("POST /login, wrong password", async () => {
    await request(app).post("/api/auth/register").send(user);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "starc@mail.com", password: "kdfmvkm" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("POST /login, wrong email", async () => {
    await request(app).post("/api/auth/register").send(user);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "strc@mail.com", password: "secret" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not Found" });
  });

  it("POST /logout", async () => {
    const register = await request(app).post("/api/auth/register").send(user);

    const token = register.body.refresh_token;
    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `refresh_token=${token}`);

    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({ message: "Logged Out" });
  });

  it("GET /me", async () => {
    const register = await request(app).post("/api/auth/register").send(user);

    const token = register.body.access_token;
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body).toEqual({
      id: 6,
      name: "starc",
      email: "starc@mail.com",
      createdAt: expect.any(String),
    });
  });
});
