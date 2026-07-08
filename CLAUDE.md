# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Agenda Digital** — a backend API for a creche (daycare) management system. Portuguese (pt-BR) is the language used throughout the codebase: variable names, comments, JSON field names, and error messages. Keep new code consistent with this — do not switch to English identifiers or messages.

Stack: Node.js + Express 5 + Prisma 5 + PostgreSQL (hosted on Neon).

## Commands

- `npm run dev` — start the dev server with nodemon (entry point: `src/server.js`)
- `npx prisma migrate dev --name <descrição>` — create/apply a migration after editing `prisma/schema.prisma`
- `npx prisma generate` — regenerate the Prisma client after schema changes
- `node prisma/seed.js` — seed the first ADMIN user (`admin@agenda.com` / `admin123`)

There is no test suite, lint config, or build step configured yet.

Env vars (`.env`, not committed): `DATABASE_URL` (Neon Postgres), `JWT_SECRET`, `PORT` (optional, defaults to 3333).

## Architecture

Standard layered Express structure under `src/`:

- `src/server.js` — app entry point, mounts middleware and routes
- `src/lib/prisma.js` — the single shared `PrismaClient` instance; always `require('../lib/prisma')` rather than instantiating a new client
- `src/routes/` — Express routers, one per resource (e.g. `authRoutes.js`)
- `src/controllers/` — route handlers containing the actual logic (e.g. `authController.js`)
- `src/middlewares/` — `autenticar.js` (JWT auth, verifies token and populates `req.usuario`) and `exigirPapel.js` (role gate; must run *after* `autenticar` since it reads `req.usuario.papel`)

Note: `autenticar.js` is currently an empty stub — auth middleware is not yet wired into routes. Any route needing protection must have `autenticar` (and optionally `exigirPapel(...)`) added to its router.

### Data model (`prisma/schema.prisma`)

Single-table-with-role design: one `Usuario` model differentiated by a `papel` enum (`RESPONSAVEL`, `PROFESSOR`, `ADMIN`) rather than separate user tables per role. Which relations on `Usuario` are populated depends on the role:
- `PROFESSOR` → `turmas`, `publicacoes`, `registrosDiario`
- `RESPONSAVEL` → `alunos` (via the `ResponsavelAluno` join table, since a student can have multiple guardians)

Other key decisions baked into the schema (see comments at the top of `schema.prisma`):
- **Feed and "recados" (announcements) are the same entity** — `Publicacao`, differentiated by a `tipo` enum (`GERAL`/`TURMA`/`INDIVIDUAL`). The feed is just a filtered view over `Publicacao`. The invariant "`TURMA` requires `turmaId`, `INDIVIDUAL` requires `alunoId`, `GERAL` requires neither" is **not enforced at the DB level** — it must be validated in the controller when creating a `Publicacao`.
- `RegistroDiario` (the daily report card) is unique per `(alunoId, data)` — one entry per student per day, enforced via `@@unique`.
- Auth tokens are signed with `{ id, papel }` and a 7-day expiry (see `authController.js`); role-based authorization elsewhere should rely on the `papel` claim rather than re-querying the DB.

When adding a new resource, follow the existing route → controller → prisma pattern, and thread `autenticar`/`exigirPapel` through the router the same way `exigirPapel.js` expects (call after `autenticar`, pass allowed roles as varargs).
