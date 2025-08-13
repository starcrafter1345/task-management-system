import { beforeAll, describe, it, expect, beforeEach } from "vitest";
import { agent } from "supertest";
import { prisma } from "../db";
import { app } from "../index";

const request = agent(app);

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const week = new Date(now);
tomorrow.setDate(week.getDate() + 7);

const userEntry = {
  name: "starc",
  email: "starc@mail.com",
  password: "secret",
};

let token: string;

describe("/dashboard", () => {
  let userId: number;

  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.task.deleteMany();
  });

  beforeAll(async () => {
    const register = await request.post("/api/auth/register").send(userEntry);

    token = register.body.access_token as string;
    userId = register.body.user.id;

    //
    // const firstCourseId = firstCourse.body.id as string;
    //
    // const secondCourse = await request
    //   .post("/api/courses")
    //   .send({
    //     name: "English",
    //     code: "E102",
    //     color: "#0000FF",
    //   })
    //   .set("Authorization", `Bearer ${token}`);
    //
    // const secondCourseId = secondCourse.body.id as string;
    //
    //
    //
    //
    // await request
    //   .post("/api/tasks")
    //   .send({
    //     title: "Phrasal verbs",
    //     description: "This task is about phrasal verbs",
    //     dueDate: new Date(Date.now() + 172800).toISOString(),
    //     courseId: secondCourseId,
    //   })
    //   .set("Authorization", `Bearer ${token}`);
    //
    // await request
    //   .post("/api/tasks")
    //   .send({
    //     title: "Present simple",
    //     description: "This task is about present simple",
    //     dueDate: new Date(Date.now() - 172800).toISOString(),
    //     courseId: secondCourseId,
    //   })
    //   .set("Authorization", `Bearer ${token}`);
  });

  beforeEach(async () => {
    await prisma.course.deleteMany();
    await prisma.task.deleteMany();
  });

  it("should return empty dashboard for new user", async () => {
    const response = await request
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: { id: userId, name: userEntry.name },
      stats: {
        tasks: {
          totalTasks: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
        },
        dueSoon: {
          today: 0,
          tomorrow: 0,
          thisWeek: 0,
        },
      },
      courses: [],
      recentTasks: [],
      upcomingDeadlines: [],
    });
  });

  it("should return correct task counts", async () => {
    const firstCourse = await request
      .post("/api/courses")
      .send({
        name: "Math",
        code: "M101",
        color: "#FFFFFF",
      })
      .set("Authorization", `Bearer ${token}`);

    const firstCourseId = firstCourse.body.id;

    const task = await request
      .post("/api/tasks")
      .send({
        title: "Functions",
        description: "This task is about functions",
        dueDate: tomorrow.toISOString(),
        courseId: firstCourseId,
      })
      .set("Authorization", `Bearer ${token}`);

    await request
      .patch(`/api/tasks/${task.body.id}/toggle`)
      .send({ completed: true })
      .set("Authorization", `Bearer ${token}`);

    await request
      .post("/api/tasks")
      .send({
        title: "Parabola",
        description: "This task is about parabola",
        dueDate: yesterday.toISOString(),
        courseId: firstCourseId,
      })
      .set("Authorization", `Bearer ${token}`);

    await request
      .post("/api/tasks")
      .send({
        title: "Quadratic functions",
        description: "This task is about quadratic functions",
        dueDate: week.toISOString(),
        courseId: firstCourseId,
      })
      .set("Authorization", `Bearer ${token}`);

    await request
      .post("/api/tasks")
      .send({
        title: "Logarithmic functions",
        description: "This task is about logarithmic functions",
        dueDate: now.toISOString(),
        courseId: firstCourseId,
      })
      .set("Authorization", `Bearer ${token}`);

    const dashboard = await request
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(dashboard.status).toBe(200);
    expect(dashboard.body.stats.tasks).toEqual({
      totalTasks: 4,
      completed: 1,
      pending: 3,
      overdue: 1,
    });
    expect(dashboard.body.stats.dueSoon.today).toBe(2);
  });

  it("should return courses with task counts", async () => {
    const course = await request
      .post("/api/courses")
      .send({
        name: "Math",
        code: "M101",
        color: "#FFFFFF",
      })
      .set("Authorization", `Bearer ${token}`);

    const courseId = course.body.id;

    await request
      .post("/api/tasks")
      .send({
        title: "Parabola",
        description: "This task is about parabola",
        dueDate: yesterday.toISOString(),
        courseId,
      })
      .set("Authorization", `Bearer ${token}`);

    const dashboard = await request
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(dashboard.body.courses).toHaveLength(1);
    expect(dashboard.body.courses[0]).toEqual({
      id: courseId,
      name: "Math",
      code: "M101",
      color: "#FFFFFF",
      taskCount: 1,
      overdueCount: 1,
    });
  });

  it("should return recent tasks", async () => {
    const course = await request
      .post("/api/courses")
      .send({
        name: "Math",
        code: "M101",
        color: "#FFFFFF",
      })
      .set("Authorization", `Bearer ${token}`);

    const courseId = course.body.id;

    await request
      .post("/api/tasks")
      .send({
        title: "Parabola",
        description: "This task is about parabola",
        dueDate: yesterday.toISOString(),
        courseId,
      })
      .set("Authorization", `Bearer ${token}`);

    const dashboard = await request
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(dashboard.body.recentTasks).toHaveLength(1);
    expect(dashboard.body.recentTasks[0]).toMatchObject({
      title: "Parabola",
      course: {
        name: "Math",
        color: "#FFFFFF",
      },
    });
  });
});
