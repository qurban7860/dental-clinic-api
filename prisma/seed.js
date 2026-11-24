import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const doctors = [
  ["a0000000-0000-4000-8000-000000000001", "Dr. Maya Chen", "Orthodontics", "+1 555-010-101", "maya.chen@fictional.example", "Mon-Fri 8:00 AM-4:00 PM", true],
  ["a0000000-0000-4000-8000-000000000002", "Dr. Liam Brooks", "General Dentistry", "+1 555-010-102", "liam.brooks@fictional.example", "Mon-Fri 9:00 AM-5:00 PM", true],
  ["a0000000-0000-4000-8000-000000000003", "Dr. Sofia Patel", "Endodontics", "+1 555-010-103", "sofia.patel@fictional.example", "Tue-Sat 8:30 AM-3:30 PM", true],
  ["a0000000-0000-4000-8000-000000000004", "Dr. Noah Williams", "Periodontics", "+1 555-010-104", "noah.williams@fictional.example", "Mon-Thu 10:00 AM-6:00 PM", true],
  ["a0000000-0000-4000-8000-000000000005", "Dr. Emma Garcia", "Pediatric Dentistry", "+1 555-010-105", "emma.garcia@fictional.example", "Mon-Fri 7:30 AM-3:30 PM", true],
  ["a0000000-0000-4000-8000-000000000006", "Dr. Ethan Rivera", "Oral Surgery", "+1 555-010-106", "ethan.rivera@fictional.example", "Wed-Fri 9:00 AM-5:00 PM", false],
];

function isoDate(offset) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}

async function main() {
  for (const [id, name, specialization, phone, email, availability, isActive] of doctors) {
    await prisma.doctor.upsert({
      where: { id },
      update: { name, specialization, phone, email, availability, isActive },
      create: { id, name, specialization, phone, email, availability, isActive },
    });
  }

  const count = await prisma.appointment.count();
  if (count === 0) {
    const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "SCHEDULED"];
    const patients = ["Avery Stone", "Jordan Lee", "Riley Martin", "Casey Morgan", "Taylor Reed", "Samira Khan", "Alex Turner", "Jamie Flores"];
    for (let i = 0; i < 18; i++) {
      const startHour = 9 + (i % 7);
      const start = new Date(isoDate(i < 6 ? i - 4 : i - 8));
      start.setUTCHours(startHour, i % 2 ? 30 : 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      await prisma.appointment.create({
        data: {
          patientName: patients[i % patients.length],
          patientContact: `+1 555-020-${String(i + 1).padStart(3, "0")}`,
          doctorId: doctors[i % 5][0],
          appointmentDate: isoDate(i < 6 ? i - 4 : i - 8),
          startTime: start,
          endTime: end,
          reason: ["Routine checkup", "Tooth pain", "Cleaning", "Fitting follow-up", "Dental consultation"][i % 5],
          status: statuses[i % statuses.length],
        },
      });
    }
  }
  console.log("Seed completed");
}

main().finally(() => prisma.$disconnect());
