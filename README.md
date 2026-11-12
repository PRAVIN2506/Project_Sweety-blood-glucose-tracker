# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application that allows users to securely record, manage, and monitor daily glucose readings through a dashboard and reporting interface.

## Features

### Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- User-specific reading access.
- Authentication rate limiting.

### Glucose Readings
- Create, view, update, and delete readings.
- Four daily reading slots:
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- Glucose values restricted to 40–600 mg/dL.
- Maximum of four readings per day.
- One reading per slot per day.
- Future dates are not allowed.

### Reports
- Daily report for a selected date.
- Month-to-date report.
- Previous calendar month's report.
- Highest and lowest glucose readings.
- Average glucose reading, rounded to one decimal place.
- Total reading count.
- Empty-state handling when no readings exist.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| State management | Redux Toolkit |
| Routing | React Router |
| HTTP client | Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcryptjs |
| Validation | Zod |
| Testing | Jest, Supertest |

## Project Structure

```text
sweety-blood-glucose-tracker/
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── readings/
│   │   │   └── reports/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── .env.example
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   └── .env.example
│
├── docs/
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before setting up the project:

- Node.js (v22 or compatible supported version).
- npm.
- PostgreSQL.
- Git.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/PRAVIN2506/Project_Sweety-blood-glucose-tracker.git
cd Project_Sweety-blood-glucose-tracker
```

### 2. Create the PostgreSQL database

Open PostgreSQL or `psql` and execute:

```sql
CREATE DATABASE sweety_db;
```

### 3. Configure the backend

Navigate to the server directory:

```bash
cd server
npm install
```

Create your local environment file:

**PowerShell:**
```powershell
Copy-Item .env.example .env
```

Update `server/.env` with your PostgreSQL credentials and a secure JWT secret:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety_db

JWT_SECRET=YOUR_SECURE_RANDOM_SECRET
JWT_EXPIRES_IN=1d
```

Replace `YOUR_PASSWORD` and `YOUR_SECURE_RANDOM_SECRET` with your actual values.

### 4. Apply database migrations

From the `server` directory:

```bash
npx prisma migrate deploy
```

This applies the committed database migrations.

### 5. Seed demo data

```bash
npx prisma db seed
```

The seed script creates a demo account and sample glucose readings.

**Demo account:**

| Field | Value |
|---|---|
| Email | demo@sweetytracker.com |
| Password | SweetyDemo@2026 |

The seed script is idempotent: running it again does not create duplicate demo users or readings.

This account is intended for local development and demonstration only.

### 6. Start the backend

```bash
npm run dev
```

Backend URL:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### 7. Configure the frontend

Open a second terminal and navigate to the project root:

```bash
cd client
npm install
```

Create the frontend environment file:

**PowerShell:**
```powershell
Copy-Item .env.example .env
```

The `client/.env` file should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

### 8. Start the frontend

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

The application is now available in your browser.

## Running Tests

The backend uses Jest and Supertest for automated API integration tests.

### 1. Create a dedicated test database

Create a separate PostgreSQL database:

```sql
CREATE DATABASE sweety_test_db;
```

**Do not use the development database for automated tests.**

### 2. Configure the test environment

From the `server` directory, create the test environment file:

```powershell
Copy-Item .env .env.test
```

Edit `server/.env.test` and change `DATABASE_URL` to point to `sweety_test_db`.

For example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety_test_db
```

Keep a valid `JWT_SECRET` in this file.

### 3. Apply migrations to the test database

In PowerShell, from the `server` directory:

```powershell
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety_test_db"

npx prisma migrate deploy

Remove-Item Env:DATABASE_URL
```

Replace the connection details with your own PostgreSQL credentials.

### 4. Run the tests

```bash
npm test
```

The test suite covers:

- Database connectivity.
- Health check and unknown routes.
- User registration and login.
- Authentication and authorization.
- Reading CRUD operations.
- Reading validation and daily limits.
- Concurrent reading creation.
- Daily, month-to-date, and monthly reports.
- User data isolation.

Tests use the dedicated `sweety_test_db` database and clean up their test data.

## API Endpoints

All endpoints are prefixed with `/api`.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Get the authenticated user |

### Readings

All reading endpoints require a valid JWT.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/readings` | Create a reading |
| GET | `/readings` | List readings |
| GET | `/readings/:id` | Get a reading |
| PUT | `/readings/:id` | Update a reading |
| DELETE | `/readings/:id` | Delete a reading |

### Reports

All report endpoints require a valid JWT and a valid `date` query parameter in `YYYY-MM-DD` format.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/reports/monthly?date=YYYY-MM-DD` | Previous month's report |

## Security and Data Integrity

- Passwords are stored as bcrypt hashes, never as plaintext.
- Protected routes require JWT authentication.
- Reading queries are scoped to the authenticated user.
- Input validation is handled using Zod.
- Helmet provides HTTP security headers.
- Authentication endpoints have rate limits.
- Database constraints enforce unique reading slots per user and date.
- Transactions and PostgreSQL advisory locks protect concurrent reading operations.

## Notes

- Never commit `.env` or `.env.test` files.
- Use `.env.example` files as configuration templates.
- The demo credentials are for development and assessment demonstration only.
- The application stores glucose values in mg/dL.
