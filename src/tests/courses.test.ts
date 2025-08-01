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
    const response = await request(app)
      .post("/api/courses")
      .send(course)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(course);
  });

  it("GET", async () => {
    const get = await request(app)
      .get("/api/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body).toMatchObject([course]);
  });

  it("PUT", async () => {
    const changingCourse = { ...course, color: "#FF00FF" };
    const put = await request(app)
      .put("/api/courses/1")
      .send(changingCourse)
      .set("Authorization", `Bearer ${token}`);

    expect(put.status).toBe(200);
    expect(put.body).toMatchObject(changingCourse);

    const getAll = await request(app)
      .get("/api/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(getAll.body).toMatchObject([changingCourse]);
  });

  it("DELETE", async () => {
    const newCourse = {
      name: "English",
      code: "C101",
      color: "#0000AF",
    };

    await request(app)
      .post("/api/courses")
      .send(newCourse)
      .set("Authorization", `Bearer ${token}`);

    const deleteCourse = await request(app)
      .delete("/api/courses/1")
      .set("Authorization", `Bearer ${token}`);

    expect(deleteCourse.status).toBe(204);

    const allCourses = await request(app)
      .get("/api/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(allCourses.body).toMatchObject([newCourse]);
  });
});
