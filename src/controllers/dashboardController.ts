import { NextFunction, Request, Response } from "express";
import { prisma } from "../db";

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = res.locals.user;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const week = new Date(today);
  week.setDate(week.getDate() + 7);

  if (!user) {
    const error = new Error("User not found");
    error.name = "Not Found";
    next(error);
    return;
  }

  const [courses, overdueCount] = await prisma.$transaction([
    prisma.course.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        _count: {
          select: { tasks: true },
        },
      },
    }),
    prisma.course.findMany({
      select: {
        _count: {
          select: {
            tasks: {
              where: {
                completed: false,
                dueDate: { lt: now },
              },
            },
          },
        },
      },
    }),
  ]);

  const coursesWithOverdue = courses.map(({ _count, ...c }, i) => ({
    ...c,
    taskCount: _count.tasks,
    overdueCount: overdueCount[i]._count.tasks,
  }));

  const [
    totalTasks,
    completed,
    pending,
    overdue,
    dueToday,
    dueTomorrow,
    thisWeek,
  ] = await prisma.$transaction([
    prisma.task.count({ where: { course: { userId: user.id } } }),
    prisma.task.count({
      where: { course: { userId: user.id }, completed: true },
    }),
    prisma.task.count({
      where: { course: { userId: user.id }, completed: false },
    }),
    prisma.task.count({
      where: {
        course: { userId: user.id },
        completed: false,
        dueDate: { lt: today },
      },
    }),
    prisma.task.count({
      where: {
        course: { userId: user.id },
        completed: false,
        dueDate: { gte: today, lt: tomorrow },
      },
    }),
    prisma.task.count({
      where: {
        course: { userId: user.id },
        completed: false,
        dueDate: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 2),
        },
      },
    }),
    prisma.task.count({
      where: {
        course: { userId: user.id },
        completed: false,
        dueDate: {
          gte: today,
          lt: week,
        },
      },
    }),
  ]);

  const stats = {
    tasks: {
      totalTasks,
      completed,
      pending,
      overdue,
    },
    dueSoon: {
      today: dueToday,
      tomorrow: dueTomorrow,
      thisWeek,
    },
  };

  const recentTasks = await prisma.task.findMany({
    where: {
      course: {
        userId: user.id,
      },
    },
    include: {
      course: {
        select: {
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const upcomingDeadlines = await prisma.task.findMany({
    where: {
      course: {
        userId: user.id,
      },
    },
    include: {
      course: {
        select: {
          name: true,
          color: true,
        },
      },
    },
    // orderBy: { dueDate: "asc" },
    take: 5,
  });

  res.status(200).json({
    user: { id: user.id, name: user.name },
    stats,
    courses: coursesWithOverdue,
    recentTasks,
    upcomingDeadlines,
  });
};

export default { getDashboard };
