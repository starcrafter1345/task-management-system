import "dotenv/config";
import cors from "cors";
import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";

const app = express();

const db = drizzle(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
app.listen(process.env.PORT, () => { console.log(`Server is started at http://localhost:${process.env.PORT!}`); });