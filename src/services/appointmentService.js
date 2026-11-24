import { prisma } from "../database/prisma.js";
import { AppError } from "../middleware/errors.js";

function toUtc(date, time) {
  const start = new Date(`${date}T${time}:00Z`);
  if (Number.isNaN(start.getTime())) throw new AppError(422, "Invalid appointment date or time");
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start, end };
}

export async function createAppointment(input) {
  const doctor = await prisma.doctor.findUnique({ where: { id: input.doctorId } });
  if (!doctor) throw new AppError(404, "Doctor not found");
  if (!doctor.isActive) throw new AppError(409, "Cannot schedule an appointment with an inactive doctor");

  const start = new Date(`${input.appointmentDate}T${input.startTime}:00Z`);
  if (start <= new Date()) throw new AppError(422, "Appointments must be scheduled in the future");
  const end = new Date(start.getTime() + input.duration * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        doctorId: input.doctorId,
        status: { not: "CANCELLED" },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict) throw new AppError(409, "The selected doctor already has an overlapping appointment");
    return tx.appointment.create({
      data: {
        ...input,
        duration: undefined,
        appointmentDate: new Date(`${input.appointmentDate}T00:00:00Z`),
        startTime: start,
        endTime: end,
      },
      include: { doctor: true },
    });
  });
}

export async function updateAppointment(id, input) {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Appointment not found");
  const doctor = await prisma.doctor.findUnique({ where: { id: input.doctorId } });
  if (!doctor) throw new AppError(404, "Doctor not found");
  if (!doctor.isActive) throw new AppError(409, "Cannot schedule an appointment with an inactive doctor");

  const start = new Date(`${input.appointmentDate}T${input.startTime}:00Z`);
  const end = new Date(start.getTime() + input.duration * 60 * 1000);
  if (start <= new Date()) throw new AppError(422, "Appointments must be scheduled in the future");

  return prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        id: { not: id },
        doctorId: input.doctorId,
        status: { not: "CANCELLED" },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict) throw new AppError(409, "The selected doctor already has an overlapping appointment");
    return tx.appointment.update({
      where: { id },
      data: {
        patientName: input.patientName,
        patientContact: input.patientContact,
        doctorId: input.doctorId,
        appointmentDate: new Date(`${input.appointmentDate}T00:00:00Z`),
        startTime: start,
        endTime: end,
        reason: input.reason,
        status: input.status,
      },
      include: { doctor: true },
    });
  });
}
