# Expense Management System

Full-stack JavaScript app with:

- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth, role-based authorization.
- Frontend: React (Vite + TypeScript) with Tailwind CSS.
- Feature flags: simple system with default `gpt5: true` ("Enable GPT-5 for all clients").

## Structure

```
client/   # React + Vite + Tailwind
server/   # Express + Mongoose + JWT
```

## Quick start

1. Server

Copy `.env.example` to `.env` in `server/` and adjust as needed.

Install and run:

```
cd server
npm install
npm run dev
```

2. Client

```
cd client
npm install
npm run dev
```

Open the client dev server URL printed by Vite. API runs on http://localhost:5000 by default.

## Scripts

- `npm run lint` and `npm run format` in both `client/` and `server/`.

## Notes

- Flags endpoint: `GET /api/flags` (requires Authorization: Bearer <token>) returns `{ gpt5: true }` for all users by default.
