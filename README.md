# PulsePass

PulsePass is a full-stack Booking & Event Management Web Application built with Next.js and MySQL. It supports three user roles:

- `organiser` — creates and manages events
- `attendee` — browses and books events
- `admin` — manages users, events, and support tickets

## Features

- Cookie-based sessions with scrypt password hashing
- Server-side validation with Zod on every form
- MySQL-backed CRUD for users, events, bookings, sessions, and contact tickets
- Role-based route protection on all dashboards
- Modular components and role-specific dashboards
- Contact form that saves submissions to the database; admins can resolve tickets
- FAQ page with user-facing questions across four categories
- About and Contact pages
- Cookie consent banner (localStorage)
- Custom styled dropdowns across the entire app (no native `<select>` popups)
- Group booking hint — attendees who request more than 6 seats are directed to Contact
- Admin can delete any event (automatically cancels all confirmed bookings)
- Admin can promote, demote, or delete any user (owner-only for other admins)
- Marketplace filter with live search, city, and category dropdowns
- Responsive layout across all pages

## Tech Stack

- Next.js 15 App Router (server components + server actions)
- React 19 with `useActionState` and `useFormStatus`
- TypeScript
- MySQL with `mysql2` (connection pooling, transactions, `SELECT FOR UPDATE`)
- Zod for schema validation
- CSS custom properties design system (dark theme + light marketplace override)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your MySQL credentials.
   If your local MySQL root user requires a password, set `DB_PASSWORD` before starting the app.
   Socket-based connections are also supported via `DB_SOCKET`.

3. Start MySQL.

4. Seed the database (drops and recreates it):

```bash
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

### Adding the contact tickets table to an existing database

If you already have the database seeded and only need to add the contact tickets table, run:

```sql
CREATE TABLE IF NOT EXISTS contact_tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON contact_tickets (status, created_at);
```

The file is also available at `database/migrate_contact_tickets.sql`.

## Demo Accounts

After seeding, use any of these accounts (password: `Passo123!`):

| Email | Role |
|---|---|
| `admin@pulsepass.local` | Admin (owner) |
| `organiser@pulsepass.local` | Organiser |
| `attendee@pulsepass.local` | Attendee |

## Project Structure

```
app/                  Pages and route handlers
  admin/              Admin control panel
  attendee/           Attendee booking dashboard
  organiser/          Organiser event dashboard
  events/[id]/        Public event detail page
  about/              About page
  contact/            Contact page (saves to DB)
  faq/                FAQ help centre
actions/              Server actions (auth, events, bookings, admin, contact)
components/
  forms/              Form components (booking, event editor, contact, register)
  layout/             Header, footer, section heading
  ui/                 Reusable UI (buttons, badges, custom select, cookie consent)
lib/                  Auth, DB helpers, queries, validation, formatting, types
database/
  schema.sql          Full MySQL schema
  migrate_contact_tickets.sql  Standalone migration for the tickets table
scripts/
  seed.js             Drops and recreates the database with demo data
```

## Assignment Coverage

| Requirement | Implementation |
|---|---|
| User registration and login | `actions/auth.ts`, register and login pages |
| Role-based access control | `requireRole()` in `lib/auth.ts`, guarded on every dashboard route |
| CRUD — Events | Organiser create / edit / delete; admin delete any event |
| CRUD — Bookings | Attendee create and cancel with race-condition protection (`SELECT FOR UPDATE`) |
| CRUD — Users | Admin update role, delete account |
| CRUD — Contact tickets | Contact form saves to DB; admin marks as resolved |
| Server-side validation | Zod schemas for every form; field errors returned to client |
| Session management | HTTP-only cookie, SHA-256 token hash, 30-day expiry |
| Modular code structure | Separated actions, components, lib helpers, and page routes |
| Responsive design | CSS grid and flex layouts collapse on small screens |
