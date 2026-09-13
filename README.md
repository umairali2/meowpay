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

- Node.js 20.9 or newer
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
