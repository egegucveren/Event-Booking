# PulsePass

PulsePass is a full-stack Booking & Event Management Web Application built with Next.js and MySQL. It supports three user roles:

- `organiser`: creates and manages events
- `attendee`: browses and books events
- `admin`: manages users and oversees the platform

The app includes:

- cookie-based sessions
- server-side validation with `zod`
- MySQL-backed CRUD for users, events, bookings, and sessions
- role-based route protection
- modular components and role-specific dashboards

## Tech Stack

- Next.js App Router
- React
- TypeScript
- MySQL with `mysql2`
- Node.js session and password utilities

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Confirm your MySQL credentials in `.env.local`.
   If you prefer a socket-based connection, you can also set `DB_SOCKET`.

3. Start MySQL.

4. Seed the database:

```bash
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

## Demo Accounts

After seeding, use any of these accounts:

- `admin@pulsepass.local` / `Passo123!`
- `organiser@pulsepass.local` / `Passo123!`
- `attendee@pulsepass.local` / `Passo123!`

## Project Structure

- `app/`: routes and pages
- `actions/`: server actions for auth, events, bookings, and admin flows
- `components/`: reusable UI and form components
- `lib/`: database, auth, validation, formatting, and query helpers
- `database/schema.sql`: MySQL schema
- `scripts/seed.js`: database seeding script

## Assignment Coverage

- User Management: registration, login, logout, admin role management
- CRUD Functionality:
  - events: organiser create, read, update, delete
  - bookings: attendee create and cancel
  - users: admin update and delete
- Server-side Validation: all critical forms are validated on the server
- Role-Based Access Control: guarded organiser, attendee, and admin areas
- Modular Code Structure: reusable components, action files, and lib helpers
- Cookies to Manage Sessions: database-backed session cookie flow
