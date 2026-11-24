import { Router } from "express";
import { prisma } from "../database/prisma.js";
import { AppError } from "../middleware/errors.js";
import { appointmentSchema } from "../validators/schemas.js";
import { createAppointment, updateAppointment } from "../services/appointmentService.js";

export const appointmentRouter = Router();

appointmentRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const doctorId = String(req.query.doctorId || "").trim();
    const date = String(req.query.date || "").trim();
    const sort = req.query.sort === "ascending" ? "asc" : "desc";
    const where = {
      ...(search && { OR: [
        { patientName: { contains: search, mode: "insensitive" } },
        { patientContact: { contains: search, mode: "insensitive" } },
        { reason: { contains: search, mode: "insensitive" } },
      ] }),
      ...(status && { status }),
      ...(doctorId && { doctorId }),
      ...(date && { appointmentDate: new Date(`${date}T00:00:00Z`) }),
    };
    const [items, total] = await prisma.$transaction([
      prisma.appointment.findMany({ where, include: { doctor: true }, orderBy: [{ appointmentDate: sort }, { startTime: sort }], skip: (page - 1) * limit, take: limit }),
      prisma.appointment.count({ where }),
    ]);
    res.json({ success: true, message: "Appointments retrieved successfully", data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
});

appointmentRouter.get("/:id", async (req, res, next) => {
  try {
    const data = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: { doctor: true } });
    if (!data) throw new AppError(404, "Appointment not found");
    res.json({ success: true, message: "Appointment retrieved successfully", data });
  } catch (error) { next(error); }
});

function validate(req) {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, "Please correct the highlighted fields", parsed.error.issues.map(i => ({ field: i.path.join("."), message: i.message })));
  return parsed.data;
}

appointmentRouter.post("/", async (req, res, next) => {
  try {
    const data = await createAppointment(validate(req));
    res.status(201).json({ success: true, message: "Appointment created successfully", data });
  } catch (error) { next(error); }
});

appointmentRouter.put("/:id", async (req, res, next) => {
  try {
    const data = await updateAppointment(req.params.id, validate(req));
    res.json({ success: true, message: "Appointment updated successfully", data });
  } catch (error) { next(error); }
});

appointmentRouter.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Appointment not found");
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { next(error); }
});
