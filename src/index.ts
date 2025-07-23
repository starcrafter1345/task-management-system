import env from "./config/env";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import coursesRouter from "./routes/coursesRouter";
import tasksRouter from "./routes/tasksRouter";
import authRouter from "./routes/authRouter";
import dashboardRouter from "./routes/dashboardRouter";
import { errorMiddleware } from "./middlewares/errorMiddleware";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
// app.use("/api", dashboardRouter);
// app.use("/api", coursesRouter);
// app.use("/api", tasksRouter);

app.use(errorMiddleware);

app.listen(env.port, () => { console.log(`Server is started at http://localhost:${String(env.port)}`); });