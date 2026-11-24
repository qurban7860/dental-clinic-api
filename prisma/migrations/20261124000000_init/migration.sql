CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "Doctor" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "specialization" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "availability" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "patientContact" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "appointmentDate" TIMESTAMP(3) NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");
CREATE INDEX "Doctor_name_idx" ON "Doctor"("name");
CREATE INDEX "Doctor_specialization_idx" ON "Doctor"("specialization");
CREATE INDEX "Doctor_isActive_idx" ON "Doctor"("isActive");
CREATE INDEX "Appointment_doctorId_appointmentDate_startTime_idx" ON "Appointment"("doctorId", "appointmentDate", "startTime");
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
