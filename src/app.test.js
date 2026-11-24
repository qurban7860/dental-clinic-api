import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const state = vi.hoisted(() => ({
  $queryRaw: vi.fn(async () => [{ "?column?": 1 }]),
}));

vi.mock("./database/prisma.js", () => ({
  prisma: {
    $queryRaw: state.$queryRaw,
    $disconnect: vi.fn(),
    $transaction: vi.fn(async (arg) => typeof arg === "function" ? arg({
      appointment: {
        findFirst: vi.fn(async () => null),
        create: vi.fn(async ({ data }) => ({ id: "appointment-1", ...data, doctor: { id: data.doctorId, name: "Dr. Test" } })),
        update: vi.fn(async ({ data }) => ({ id: "appointment-1", ...data, doctor: { id: data.doctorId, name: "Dr. Test" } })),
      },
    }) : Promise.all(arg)),
    doctor: {
      count: vi.fn(async () => 0),
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(async () => null),
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }) => ({ id: "doctor-1", ...data })),
      update: vi.fn(async ({ where, data }) => ({ id: where.id, ...data })),
      delete: vi.fn(async () => undefined),
    },
    appointment: {
      count: vi.fn(async () => 0),
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(async () => null),
      findFirst: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
    },
  },
}));

import { createApp } from "./app.js";

beforeEach(() => vi.clearAllMocks());

describe("API", () => {
  it("returns database health", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.data.database).toBe("connected");
  });

  it("returns a standardized not-found response", async () => {
    const res = await request(createApp()).get("/api/missing");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("validates doctor creation", async () => {
    const res = await request(createApp()).post("/api/doctors").send({ name: "A" });
    expect(res.status).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("creates a valid doctor", async () => {
    const res = await request(createApp()).post("/api/doctors").send({
      name: "Dr. Test",
      specialization: "General Dentistry",
      phone: "+1 555-010-900",
      email: "test@fictional.example",
      availability: "Mon-Fri",
      isActive: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("test@fictional.example");
  });

  it("validates appointment input", async () => {
    const res = await request(createApp()).post("/api/appointments").send({ patientName: "A" });
    expect(res.status).toBe(422);
  });
});
