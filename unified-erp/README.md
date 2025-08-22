# Unified Real Estate & Treasury ERP

This is a comprehensive, production-ready ERP system built with a modern tech stack, focusing on the real estate and treasury management domains. It features a clean, extensible, and well-tested codebase.

## Features

- **Core Modules**: Real Estate, Treasury, Accounting, Projects
- **Tech Stack**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js v5 with Role-Based Access Control (RBAC)
- **Reporting**: PDF and Excel report generation
- **Key Principles**: Double-Entry Accounting, Document Reversal, Audit Logs

## Quick Start Guide

Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites

- Node.js (v18 or later)
- npm or pnpm or yarn
- PostgreSQL database (e.g., via Docker or a cloud provider like Neon)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd unified-erp
npm install
```

### 3. Environment Setup

Copy the example environment file and update it with your database credentials and a new `NEXTAUTH_SECRET`.

```bash
cp .env.example .env
```

Open `.env` and fill in the following variables:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A strong secret. You can generate one with `openssl rand -base64 32`.

### 4. Database Migration

Apply the database schema and generate the Prisma Client:

```bash
npx prisma migrate dev --name init
```

This command will synchronize your database schema with `prisma/schema.prisma`.

### 5. Seed Initial Data

Populate the database with an admin user and a default chart of accounts:

```bash
npm run seed
```

### 6. Run the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Demo Credentials

After seeding the database, you can log in with the following credentials:

- **Email**: `admin@unified.erp`
- **Password**: `password123`

## Authentication

Authentication is enabled by default. To disable it for development or testing purposes, set the following variable in your `.env` file:

```
ENABLE_AUTH=false
```

When `ENABLE_AUTH` is `false`, all protected routes will be accessible without logging in.

## Available Scripts

- `dev`: Starts the development server.
- `build`: Creates a production build.
- `start`: Starts the production server.
- `lint`: Lints the codebase.
- `format`: Formats the code with Prettier.
- `db:generate`: Generates the Prisma Client.
- `db:migrate`: Applies database migrations.
- `db:studio`: Opens Prisma Studio to view/edit data.
- `seed`: Runs the database seeding script.
- `test`: Runs tests with Vitest.
- `backup:run`: Executes a manual database backup.
