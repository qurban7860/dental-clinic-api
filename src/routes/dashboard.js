import { Router } from "express";
import { prisma } from "../database/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const [totalDoctors, upcomingAppointments, todayAppointments, pendingAppointments, recent] = await prisma.$transaction([
      prisma.doctor.count(),
      prisma.appointment.count({ where: { appointmentDate: { gte: start }, status: { not: "CANCELLED" } } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: start, lt: end } } }),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.findMany({
        where: { appointmentDate: { gte: start }, status: { not: "CANCELLED" } },
        include: { doctor: true },
        orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
        take: 8,
      }),
    ]);
    res.json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: { totalDoctors, upcomingAppointments, todayAppointments, pendingAppointments, appointments: recent },
    });
  } catch (error) { next(error); }
});
