# TeamFlow — Team Task Manager (Frontend)

Professional React + Vite frontend for the Team Task Manager assignment.
Pure JavaScript, plain CSS (no Tailwind, no UI framework).

## Stack
- React 18 (JS)
- Vite 5
- React Router v6
- Plain CSS3 design system

## Pages
- `/login`, `/signup` — authentication
- `/dashboard` — totals, by-status bars, per-user, recent projects, overdue
- `/projects` — list & create projects
- `/projects/:id` — Kanban board, members tab, role-aware actions
- `/my-tasks` — tasks assigned to the current user with filters

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm run dev
```

Build: `npm run build` · Preview: `npm run preview`

## Backend API expected

Token-based auth. Frontend sends `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | /auth/signup | `{ name, email, password }` → `{ token, user }` |
| POST | /auth/login  | `{ email, password }` → `{ token, user }` |
| GET  | /projects | list projects for the user |
| POST | /projects | create project (creator becomes Admin) |
| GET  | /projects/:id | project details (with `members`) |
| POST | /projects/:id/members | `{ email }` add member (Admin) |
| DELETE | /projects/:id/members/:memberId | remove member (Admin) |
| GET  | /projects/:id/tasks | list project tasks |
| POST | /projects/:id/tasks | create task |
| GET  | /tasks | all tasks visible to user |
| GET  | /tasks/me | current user's tasks |
| PATCH | /tasks/:id | update (e.g. `{ status }`) |

The user object should include `_id`/`id`, `name`, `email`, optional `role`.
A project should expose `members: [{ _id, name, email, role }]` and `adminId`/`createdBy`.

## Deploy on Railway

1. Push repo to GitHub.
2. New Railway project → Deploy from repo.
3. Set env var `VITE_API_BASE_URL=https://your-backend.up.railway.app/api`.
4. Build command: `npm run build` · Start command: `npm run preview`.
   (Vite preview binds to `$PORT` automatically.)
