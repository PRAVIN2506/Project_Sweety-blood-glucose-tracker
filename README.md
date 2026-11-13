# Sweety - Blood Glucose Tracker

Sweety is a full-stack web application for recording daily blood glucose readings and viewing summaries over different date ranges.

It was built as a take-home assignment for the Junior Full Stack Developer role at Kenpath.

## Features

- Register and log in with an email and password.
- Passwords are hashed with bcrypt.
- Each user can access only their own readings.
- Add, view, edit, and delete glucose readings.
- Record readings in four daily slots: morning fasting, after breakfast, after lunch, and after dinner.
- Accept whole-number values from 40 to 600 mg/dL.
- Allow no more than one reading per slot per day and four readings per day.
- Reject future dates using the user's IANA timezone.
- View daily, month-to-date, and previous-month reports.
- Show the highest, lowest, average, and total number of readings.
- Provide toast notifications and confirmation before deleting a reading.

## Technology

- Frontend: React, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Authentication: JWT and bcryptjs
- Tests: Jest and Supertest

Use the package files (`client/package.json` and `server/package.json`) for the exact dependency versions.

## Requirements

- Node.js 20 or later
- npm 10 or later
- PostgreSQL 15 or later
- Git

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/PRAVIN2506/Project_Sweety-blood-glucose-tracker.git
cd Project_Sweety-blood-glucose-tracker
```

### 2. Create the databases

Create two PostgreSQL databases:

```sql
CREATE DATABASE sweety_db;
CREATE DATABASE sweety_test_db;
```

### 3. Configure and start the backend

Open a terminal in the project directory:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and set your local PostgreSQL password and a private JWT secret:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety_db?schema=public"
JWT_SECRET="replace_with_a_long_random_secret"
JWT_EXPIRES_IN="1d"
```

Apply the database migrations and insert the demo data:

```powershell
npx prisma migrate deploy
npx prisma db seed
```

Start the backend:

```powershell
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### 4. Configure and start the frontend

Open a second terminal in the project directory:

```powershell
cd client
npm install
Copy-Item .env.example .env
```

The `client/.env` file should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```powershell
npm run dev
```

Open `http://localhost:5173`.

## Demo account

The seed script creates this demo account:

| Field | Value |
|---|---|
| Email | `demo@sweetytracker.com` |
| Password | `SweetyDemo@2026` |

The seed script inserts sample readings for two previous days. It is safe to run more than once and refuses to run when `NODE_ENV=production`.

## API overview

Protected endpoints require this header:

```text
Authorization: Bearer <token>
```

Reading create and update requests also use:

```text
X-Time-Zone: <IANA time zone>
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status |
| POST | `/api/auth/register` | Register an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the current user |
| GET | `/api/readings` | List the current user's readings |
| GET | `/api/readings/:id` | Get one reading |
| POST | `/api/readings` | Create a reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/api/reports/monthly?date=YYYY-MM-DD` | Previous calendar month report |

## Tests and checks

### Backend

The test suite uses the separate `sweety_test_db` database. Create `server/.env.test` by copying `server/.env`, then change `DATABASE_URL` to point to `sweety_test_db`.

Before running tests for the first time, apply migrations to the test database. In PowerShell, from `server`:

```powershell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety_test_db?schema=public"
npx prisma migrate deploy
Remove-Item Env:DATABASE_URL
```

Then run:

```powershell
npm test
npx prisma validate
```

The test setup checks that `DATABASE_URL` points to `sweety_test_db` before running tests.

### Frontend

From `client`:

```powershell
npm run lint
npm run build
```

## Screenshots

The screenshots are in [`docs/screenshots/`](docs/screenshots/):

1. Login
2. Registration
3. Dashboard
4. Readings list
5. Reading form
6. Delete confirmation
7. Daily report
8. Month-to-date report
9. Previous-month report
10. Toast notification

## Notes: assumptions and trade-offs

- A reading's date is a calendar date, not a timestamp. The database stores it as a PostgreSQL `DATE`.
- The frontend sends the user's IANA timezone in the `X-Time-Zone` header. The backend uses it to reject dates that are in the future for that timezone. If the header is missing, the backend uses UTC.
- The four reading slots are fixed. A user can record at most one reading in each slot per day.
- JWTs are stateless and expire after one day. Logging out clears the client-side session; it does not revoke an already-issued token on the server.
- Authentication rate limiting uses an in-memory store, which is suitable for a single server instance. A multi-instance deployment would need shared rate-limit storage.

## Improvements with more time

- Add frontend component and interaction tests.
- Add pagination for long reading histories.
- Add an optional monthly trend chart.
- Add Docker Compose for local setup.
- Improve deployment configuration and centralized monitoring.

## Scope

Sweety records and summarizes user-entered glucose readings. It does not diagnose conditions, recommend treatment, or replace advice from a qualified healthcare professional.
