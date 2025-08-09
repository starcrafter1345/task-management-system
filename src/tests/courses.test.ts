import { describe, it, expect, beforeAll } from "vitest";
import { agent } from "supertest";
import { prisma } from "../db";
import { app } from "../index";

import { CourseFormEntry } from "../types/Course";
import { RegisterFormEntry } from "../types/User";

const request = agent(app);

const user: RegisterFormEntry = {
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
let course;

describe("/courses", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.task.deleteMany();
  });

  beforeAll(async () => {
    const response = await request.post("/api/auth/register").send(user);
    token = response.body.access_token;
  });

  it("POST", async () => {
    const createCourse = await request
      .post("/api/courses")
      .send(courseEntry)
      .set("Authorization", `Bearer ${token}`);

    expect(createCourse.status).toBe(201);
    expect(createCourse.body).toMatchObject(courseEntry);
    course = createCourse.body;
  });

  it("POST, wrong color input", async () => {
    const createCourse = await request
      .post("/api/courses")
      .send({ ...courseEntry, color: "#ff" })
      .set("Authorization", `Bearer ${token}`);

    expect(createCourse.status).toBe(400);
    expect(createCourse.body).toEqual({
      error: "Bad Request",
      cause:
        "Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).",
    });
  });

  it("GET", async () => {
    const getCourse = await request
      .get("/api/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(getCourse.status).toBe(200);
    expect(getCourse.body).toMatchObject([courseEntry]);
  });

  it("PUT", async () => {
    const changingCourse = { ...courseEntry, color: "#FF00FF" };
    const putCourse = await request
      .put(`/api/courses/${course.id}`)
      .send(changingCourse)
      .set("Authorization", `Bearer ${token}`);

    expect(putCourse.status).toBe(200);
    expect(putCourse.body).toMatchObject(changingCourse);

    const getAllCourses = await request
      .get("/api/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(getAllCourses.body).toMatchObject([changingCourse]);
  });

  it("DELETE", async () => {
    const newCourseEntry = {
      name: "English",
      code: "C101",
      color: "#0000AF",
    };

    const newCourse = await request
      .post("/api/courses")
      .send(newCourseEntry)
      .set("Authorization", `Bearer ${token}`);

    const deleteCourse = await request
      .delete(`/api/courses/${newCourse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteCourse.status).toBe(204);

    const getAllCourses = await request
      .get("/api/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(getAllCourses.body).toMatchObject([
      { ...courseEntry, color: "#FF00FF" },
    ]);
  });
});
