import { beforeAll, describe, it, expect } from "vitest";
import { agent } from "supertest";
import { app } from "../index";
import { CourseFormEntry } from "../types/Course";
import { prisma } from "../db";

const request = agent(app);

const user = {
  name: "starc",
  email: "starc@mail.com",
  password: "secret",
};

const courseEntry: CourseFormEntry = {
  name: "Math",
  code: "M101",
  color: "#FFFFFF",
};

let token: string;
let courseId: number;
let taskEntry;
let task;

describe("/tasks", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.task.deleteMany();
  });

  beforeAll(async () => {
    const register = await request.post("/api/auth/register").send(user);

    token = register.body.access_token as string;

    const course = await request
      .post("/api/courses")
      .send(courseEntry)
      .set("Authorization", `Bearer ${token}`);

    courseId = course.body.id as number;

    taskEntry = {
      title: "Functions",
      description: "This task is about functions",
      dueDate: new Date(Date.now() + 86400).toISOString(),
      courseId,
    };
  });

  const expectedTask = {
    id: expect.any(Number) as number,
    courseId: expect.any(Number) as number,
    title: "Functions",
    description: "This task is about functions",
    completed: false,
    createdAt: expect.any(String) as string,
    updatedAt: expect.any(String) as string,
    dueDate: expect.any(String) as string,
    course: {
      id: expect.any(Number) as number,
      name: "Math",
      code: "M101",
      color: "#FFFFFF",
    },
  };

  it("POST", async () => {
    const createTask = await request
      .post("/api/tasks")
      .send(taskEntry)
      .set("Authorization", `Bearer ${token}`);

    expect(createTask.status).toBe(201);
    expect(createTask.body).toEqual(expectedTask);

    task = createTask.body;
  });

  it("GET", async () => {
    const getTasks = await request
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(getTasks.status).toBe(200);
    expect(getTasks.body).toEqual([
      { ...expectedTask, isOverdue: false, status: "today" },
    ]);
  });

  it("PUT", async () => {
    const changeTask = await request
      .put(`/api/tasks/${task.id}`)
      .send({ ...taskEntry, description: "This task is was about functions" })
      .set("Authorization", `Bearer ${token}`);

    expect(changeTask.status).toBe(200);
    expect(changeTask.body).toMatchObject({
      ...expectedTask,
      description: "This task is was about functions",
    });
  });

  it("PATCH /:id/toggle", async () => {
    const toggleTask = await request
      .patch(`/api/tasks/${task.id}/toggle`)
      .send({ completed: !task.completed })
      .set("Authorization", `Bearer ${token}`);

    expect(toggleTask.status).toBe(200);
  });

  it("DELETE", async () => {
    const deleteTask = await request
      .delete(`/api/tasks/${task.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteTask.status).toBe(204);

    const getTasks = await request
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(getTasks.body).toEqual([]);
  });
});
