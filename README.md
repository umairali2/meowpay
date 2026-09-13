# MeowPay

MeowPay is a thin, end-to-end digital wallet slice where Whiskers sends treats to another cat. It includes a responsive web interface, a real API, atomic balance updates, transfer records, and SQLite persistence.

## Features

- View Whiskers' current treat balance
- Choose an eligible recipient
- Validate a positive whole-number amount
- Send treats through a real backend
- Update sender and recipient balances atomically
- Record successful transfers
- Show loading, processing, success, and error states

## Stack

- Next.js, React, TypeScript, and Bootstrap
- Node.js, Express, and TypeScript
- SQLite with `better-sqlite3`
- Vitest and Supertest

## Requirements

- Node.js 20.19 or newer
- npm

## Run locally

Clone the repository and open the project directory:

```bash
git clone <repository-url>
cd meowpay
```

Install, initialize, seed, and start the backend:

```bash
cd backend
npm install
npm run db:seed
npm run dev
```

The API runs at `http://localhost:4000`.

In a second terminal, install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The default configuration works without local environment files. To customize the frontend API URL, copy its example:

```bash
cp frontend/.env.example frontend/.env.local
```

Backend values can be provided through the shell, for example `PORT=4100 npm run dev`. The application defaults are:

```text
PORT=4000
DATABASE_PATH=./data/meowpay.sqlite
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## API

### `GET /health`

Returns the backend health status.

### `GET /api/wallet`

Returns Whiskers and the current persisted balance.

### `GET /api/cats`

Returns eligible recipients, excluding Whiskers.

### `POST /api/transfers`

Request:

```json
{
  "recipientId": 2,
  "amount": 25
}
```

A successful request updates both balances in one SQLite transaction and creates a transfer record.

## Business rules

- Treat amounts must be positive whole numbers.
- The recipient must exist and cannot be Whiskers.
- Whiskers must have enough treats for the transfer.
- A failed transfer changes no balances and creates no transfer record.
- Balances cannot become negative.

## Decisions and trade-offs

- Whiskers represents the authenticated wallet owner. Authentication was intentionally excluded so the exercise stays focused on money movement.
- Treats are stored as integers to avoid floating-point currency errors.
- SQLite provides real persistence with almost no local setup.
- `better-sqlite3` keeps the data layer small and makes the balance updates and transfer record easy to wrap in one synchronous transaction.
- Bootstrap provides responsive, accessible form primitives without introducing a custom design system.
- The frontend uses local React state because this single-screen flow does not justify a global state library.
- Transfer records are persisted for correctness and auditing, but a transaction-history interface is outside this slice.

## Intentionally skipped

- Authentication and registration
- Sender switching
- Cat management
- Wallet top-ups
- Transaction-history UI
- Notifications
- Multiple currencies
- Production deployment infrastructure

## AI-assisted workflow

This project was developed with Devin as a coding agent. The work was divided into small phases and tasks, and each implementation task was reviewed, verified, and committed before moving to the next one.

AI assistance was used to:

- Translate the assignment into a deliberately narrow vertical slice
- Plan the database schema and REST contracts
- Implement the Express, SQLite, and Next.js code
- Add API and persistence tests
- Exercise the completed flow in a browser
- Review accessibility, error behavior, and documentation

Representative prompts included:

- Define the minimum end-to-end transfer scope without adding authentication or unrelated wallet features.
- Implement an atomic SQLite transfer that cannot overdraw the sender.
- Add a controlled Next.js transfer form with processing, success, and error states.
- Verify client validation, database rollback behavior, persistence, builds, and security audits.

All generated changes were checked through code review, TypeScript builds, frontend linting, 19 backend tests, browser interaction, direct database inspection, and dependency audits. Architectural and scope decisions remain the author's responsibility.

## Verification

Backend:

```bash
cd backend
npm test
npm run build
npm audit --audit-level=high
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm audit --audit-level=high
```
