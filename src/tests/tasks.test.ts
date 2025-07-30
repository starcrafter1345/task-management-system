import { beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index";
import { CourseFormEntry } from "../types/Course";

const user = {
  name: "starc",
  email: "starc@mail.com",
  password: "secret",
};

let token: string;

const courseEntry: CourseFormEntry = {
  name: "Math",
  code: "M101",
  color: "#FFFFFF",
};

describe("/tasks", () => {
  beforeAll(async () => {
    const register = await request(app).post("/api/auth/register").send(user);

    token = register.body.access_token;

    await request(app)
      .post("/api/courses")
      .send(courseEntry)
      .set("Authorization", `Bearer ${token}`);
  });

  it("POST", async () => {
    const createTask = await request(app)
      .post("/api/tasks")
      .send({
        title: "Functions",
        description: "This task is about functions",
        due_date: new Date(Date.now() + 86400),
        courseId: 1,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(createTask.status).toBe(201);
    expect(createTask.body).toEqual({
      id: 1,
      title: "Functions",
      description: "This task is about functions",
      completed: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      course: {
        id: 1,
        name: "Math",
        code: "M101",
        color: "#FFFFFF",
      },
    });
  });
});
