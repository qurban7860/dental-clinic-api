import { Router } from "express";
import { prisma } from "../database/prisma.js";
import { AppError } from "../middleware/errors.js";
import { doctorSchema } from "../validators/schemas.js";

export const doctorRouter = Router();

doctorRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
    const search = String(req.query.search || "").trim();
    const specialization = String(req.query.specialization || "").trim();
    const status = String(req.query.status || "").trim();
    const where = {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(specialization && { specialization: { equals: specialization, mode: "insensitive" } }),
      ...(status === "active" && { isActive: true }),
      ...(status === "inactive" && { isActive: false }),
    };
    const [data, total] = await prisma.$transaction([
      prisma.doctor.findMany({
        where,
        include: { _count: { select: { appointments: true } } },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ]);
    res.json({ success: true, message: "Doctors retrieved successfully", data: { items: data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
});

doctorRouter.get("/:id", async (req, res, next) => {
  try {
    const data = await prisma.doctor.findUnique({ where: { id: req.params.id }, include: { _count: { select: { appointments: true } } } });
    if (!data) throw new AppError(404, "Doctor not found");
    res.json({ success: true, message: "Doctor retrieved successfully", data });
  } catch (error) { next(error); }
});

doctorRouter.post("/", async (req, res, next) => {
  try {
    const parsed = doctorSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, "Please correct the highlighted fields", parsed.error.issues.map(i => ({ field: i.path.join("."), message: i.message })));
    const existing = await prisma.doctor.findUnique({ where: { email: parsed.data.email } });
    if (existing) throw new AppError(409, "A doctor with this email already exists");
    const data = await prisma.doctor.create({ data: parsed.data });
    res.status(201).json({ success: true, message: "Doctor created successfully", data });
  } catch (error) { next(error); }
});

doctorRouter.put("/:id", async (req, res, next) => {
  try {
    const parsed = doctorSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, "Please correct the highlighted fields", parsed.error.issues.map(i => ({ field: i.path.join("."), message: i.message })));
    const existing = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Doctor not found");
    const duplicate = await prisma.doctor.findFirst({ where: { email: parsed.data.email, id: { not: req.params.id } } });
    if (duplicate) throw new AppError(409, "A doctor with this email already exists");
    const data = await prisma.doctor.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, message: "Doctor updated successfully", data });
  } catch (error) { next(error); }
});

doctorRouter.delete("/:id", async (req, res, next) => {
  try {
    const data = await prisma.doctor.findUnique({ where: { id: req.params.id }, include: { _count: { select: { appointments: true } } } });
    if (!data) throw new AppError(404, "Doctor not found");
    if (data._count.appointments > 0) throw new AppError(409, "This doctor cannot be deleted because existing appointments are linked to the record");
    await prisma.doctor.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { next(error); }
});
