# DeFi Direct - Automated Yield Platform

## Overview

DeFi Direct is a web application that simplifies the flow of Brazilian Real (BRL) via PIX into DeFi yield farming protocols. The platform automates the entire pipeline: PIX deposit → stablecoin conversion (USDT) → cross-chain bridging → staking in yield protocols. The goal is to let users send a PIX payment and have their funds automatically invested in dollar-denominated yield contracts without needing to understand blockchain mechanics, configure RPC networks, or manage gas tokens.

The app features a unified dashboard showing portfolio value, accumulated yields, transaction history, and investment plans (3, 6, and 12-month lock periods with varying APY). It operates with a No-KYC privacy-first approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; React Context for auth state
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming; dark theme with glassmorphism design (glass-panel effects, gradient backgrounds, blur overlays)
- **Animations**: Framer Motion for page transitions and UI animations
- **Charts**: Recharts for portfolio performance visualization
- **Fonts**: Inter (UI text) and Space Grotesk (display/numbers)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 on Node.js with TypeScript (run via tsx)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Key Endpoints**:
  - `POST /api/auth/register` and `POST /api/auth/login` - Simple username/password auth
  - `POST /api/deposit` - Generate PIX key and create deposit transaction
  - `GET /api/transactions/:userId` - User transaction history
  - `GET /api/investments/:userId` - User investments
  - `GET /api/dashboard/:userId` - Aggregated portfolio stats
  - `POST /api/invest` - Create new investment in a yield plan
  - `POST /api/deposit/:id/confirm` - Simulate confirming a PIX deposit
- **Authentication**: Simple localStorage-based auth on client; no session middleware currently (passwords stored in plain text — this is a prototype)

### Data Layer
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema** (in `shared/schema.ts`):
  - `users` - id (UUID), username, password, email, displayName
  - `transactions` - id (UUID), userId (FK), type (deposit/interest/withdrawal), amountBrl, amountUsd, status, protocol, details, stage (0-4 processing stages), createdAt
  - `investments` - id (UUID), userId (FK), planId, amountUsd, currentValue, apy, protocol, network, active, startedAt
- **Validation**: Zod schemas generated from Drizzle schema via `drizzle-zod`
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)

### Build System
- **Development**: Vite dev server proxied through Express; HMR via Vite middleware
- **Production Build**: Client built with Vite to `dist/public/`; server bundled with esbuild to `dist/index.cjs`
- **Scripts**: `npm run dev` starts dev server, `npm run build` creates production bundle, `npm run db:push` syncs schema to database

### Project Structure
```
client/           # Frontend React application
  src/
    components/   # Reusable components (layout, deposit-modal, UI primitives)
    pages/        # Route pages (dashboard, auth, transactions, investments, settings)
    hooks/        # Custom React hooks
    lib/          # Utilities (auth context, query client, utils)
server/           # Backend Express application
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database access layer (IStorage interface + DatabaseStorage)
  db.ts           # Database connection setup
  vite.ts         # Vite dev middleware setup
  static.ts       # Production static file serving
shared/           # Shared code between client and server
  schema.ts       # Drizzle database schema + Zod validation schemas
```

### Key Design Decisions
1. **Storage Interface Pattern**: `IStorage` interface in `storage.ts` abstracts data access, making it possible to swap implementations (e.g., for testing)
2. **Shared Schema**: Database schema lives in `shared/` so both client and server can import types
3. **Simulated DeFi Pipeline**: The deposit flow simulates a multi-stage process (PIX detection → DPIX minting → cross-chain bridge → staking) with stage tracking, but actual blockchain integrations are not yet implemented
4. **No Real Auth Security**: Current auth is minimal (plain text passwords, localStorage tokens) — suitable for prototype only

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Must be provisioned and connected via `DATABASE_URL` environment variable. Used for all persistent data storage (users, transactions, investments)

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and schema management
- **express**: HTTP server framework (v5)
- **@tanstack/react-query**: Server state management
- **recharts**: Chart visualization
- **framer-motion**: Animations
- **shadcn/ui ecosystem**: Radix UI primitives, class-variance-authority, tailwind-merge, clsx
- **zod** + **drizzle-zod**: Runtime validation
- **wouter**: Client-side routing
- **connect-pg-simple**: PostgreSQL session store (available but not actively used yet)

### Planned Integrations (from requirements, not yet implemented)
- PIX payment gateway for BRL on-ramp
- SideShift.ai or similar bridge API for cross-chain transfers
- DeFi protocol smart contract integration (yield farming/staking)
- Embedded non-custodial wallet (WalletConnect or similar)
- Ethers.js/Wagmi for EVM chain interaction
- Liquid Network libraries for Bitcoin sidechain operations