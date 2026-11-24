import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./database/prisma.js";
import { doctorRouter } from "./routes/doctors.js";
import { appointmentRouter } from "./routes/appointments.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin.split(",").map(v => v.trim()) }));
  app.use(express.json({ limit: "100kb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/api/health", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ success: true, message: "API and database are healthy", data: { status: "ok", database: "connected", timestamp: new Date().toISOString(), environment: process.env.NODE_ENV || "development" } });
    } catch {
      res.status(503).json({ success: false, message: "Database unavailable", errors: [] });
    }
  });
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/doctors", doctorRouter);
  app.use("/api/appointments", appointmentRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
