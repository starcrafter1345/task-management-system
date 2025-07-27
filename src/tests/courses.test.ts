import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

import { CourseFormEntry } from "../types/Course";
import { RegisterFormEntry } from "../types/User";

const user: RegisterFormEntry = {
  name: "starc",
  email: "starc@mail.com",
  password: "secret",
};

const course: CourseFormEntry = {
  name: "Math",
  code: "M101",
  color: "#FFFFFF",
};

let token: string;

describe("/courses", () => {
  beforeAll(async () => {
    const response = await request(app).post("/api/auth/register").send(user);
    token = response.body.access_token;
  });

  it("POST", async () => {
    const response = await request(app).post("/api/courses").send(course).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(course);
  });

  it("GET", async () => {
    const get = await request(app).get("/api/courses").set("Authorization", `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body).toEqual([course]);
  });
});