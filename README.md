# Dental Clinic API

Standalone Express/Prisma API for the Dental Clinic Management System.

Repository: https://github.com/qurban7860/dental-clinic-api

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Set `DATABASE_URL` in `.env` to a PostgreSQL connection. Use a rotated Supabase session-pooler URI on port 5432 for Supabase; percent-encode reserved password characters and require TLS. Never commit `.env` or paste database credentials into source control.

To run migrations safely against a configured production database:

```powershell
npx prisma migrate status
npx prisma migrate deploy
```

Do not run the seed script against production unless fictional demo data is explicitly wanted.

## API and tests

- Health: `GET /api/health`
- Dashboard: `/api/dashboard`
- Doctors: `/api/doctors`
- Appointments: `/api/appointments`

```powershell
npm test
```

## Render

The included `render.yaml` deploys the Node service. Add `DATABASE_URL` and `CLIENT_URL` in the Render service Environment settings. The build runs Prisma Client generation and `prisma migrate deploy`; frontend URL must be the exact allowed origin.
