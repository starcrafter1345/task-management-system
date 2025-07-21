import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("/auth", () => {
  it("POST /register", async () => {
    const response = await request(app).post("/api/auth/register");

    expect(response.status).toBe(200);
  });
});