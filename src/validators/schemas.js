import { z } from "zod";

const statuses = ["PENDING", "SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"];

export const doctorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  specialization: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+()\d][\d\s()+-]{7,24}$/),
  email: z.string().trim().email().max(160),
  availability: z.string().trim().min(2).max(300),
  isActive: z.boolean().default(true),
});

export const appointmentSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  patientContact: z.string().trim().min(7).max(40),
  doctorId: z.string().uuid(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.coerce.number().int().min(15).max(240).optional().default(30),
  reason: z.string().trim().min(3).max(500),
  status: z.enum(statuses).default("PENDING"),
});
