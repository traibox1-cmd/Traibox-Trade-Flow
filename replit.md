# TRAIBOX

## Overview
TRAIBOX is an AI-first trade workspace application designed for managing international trade operations. It provides a trust-first chat and cards workflow spanning compliance, finance, payments, and proof management. The platform enables trade operators and financiers to plan trades, run compliance checks, manage funding, process payments, and generate verifiable proof packs.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query for server state, React Context for app-level state
- **Styling**: Tailwind CSS v4 with CSS variables for theming, supports light/dark modes
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with SSE for streaming chat responses
- **AI Integration**: OpenAI GPT-4o-mini for conversational trade intelligence with intent detection
- **Build**: esbuild for production bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**: users, conversations, messages
- **Migrations**: Managed via drizzle-kit

### Application Structure
- **Client**: `client/src/` (React application)
- **Server**: `server/` (Express API)
- **Shared**: `shared/` (Database schema and types)
- **Path Aliases**: `@/` for client, `@shared/` for shared modules

### Key Features
- **AI Chat with Bulletproof Demo Fallback**: Streaming chat with contextual responses. Falls back to demo responses if OpenAI fails.
- **Role-based UI**: Dual personas (Operator vs Financier) with distinct navigation and default landing pages.
- **Trade Intelligence**: Clean, focused AI chat interface with quick actions for trade planning, compliance checks, risk analysis, and market trends.
- **Trade Workspace**: Consolidated view for managing trades with search, filters, and quick access to Finance and Compliance.
- **My Network**: Partner directory with roles, trust levels, and service capabilities.
- **Finance Module**: Payments and Funding tabs with request management.
- **Compliance & Proofs**: Multi-tab interface (Checks, Reports, Proof Packs, Verification, Trade Passport, Track & Trace).
- **Customizable Dashboard**: Drag-and-drop widget dashboard with 14 widget types (Portfolio Overview, Trade Volume, Market Pulse, Risk Score, Trade Passport, Trade Corridors, Deadlines, Activity Feed, etc.). Features widget gallery with category filters, real-time data updates (Market Pulse with live FX rates, Countdown timers), resize/reorder/remove widgets, localStorage persistence, edit mode.
- **Clean Navigation**: Perplexity-inspired collapsed left rail (72px collapsed, 240px expanded) with role-aware navigation, submenus, notification badges.
- **Design System**: Premium minimal design with consistent card patterns, rounded-2xl elements, shadow-xs, gradient accents, backdrop-blur effects, and theme support.

## External Dependencies

### AI Services
- **OpenAI API**: For chat completions and intent detection (GPT-4o-mini).
  - Environment variable: `OPENAI_API_KEY`

### Database
- **PostgreSQL**: Primary data store.
  - Environment variable: `DATABASE_URL`

### Authentication
- `express-session` with `connect-pg-simple`
- `Passport.js` for local authentication

### UI Dependencies
- Radix UI primitives
- Lucide React
- cmdk
- embla-carousel
- react-day-picker
- recharts
- vaul

## UI Smoke Test Checklist

After a fresh reload, click "Load Demo Data" (in Settings or onboarding), then verify the following screens show meaningful content:

### Operator Role
- [ ] **My Space**: Shows 2 demo trades (Kenya Coffee Import, Medical Supplies Export) with status badges
- [ ] **Trade Intelligence**: Chat interface loads, can send messages, receives AI responses
- [ ] **Trade Workspace**: Selecting a trade shows Overview, Parties (3 linked partners), Documents, Timeline tabs
- [ ] **My Network → Directory**: Shows 3 partners (NordWerk Logistics, Aster Mills, Kijani Cooperative) with roles
- [ ] **Finance → Funding**: Shows 1 funding request ($200K LC for Kenya Coffee)
- [ ] **Finance → Payments**: Shows 1 completed payment ($50K advance)
- [ ] **Compliance → Checks**: Shows compliance check summary
- [ ] **Compliance → Reports**: Shows 2 compliance runs (1 passed, 1 failed with missing items)
- [ ] **Compliance → Proof Packs**: Shows 2 proof packs (1 ready, 1 draft)
- [ ] **Compliance → Trade Passport**: Shows passport data with missing items flagged
- [ ] **Compliance → Track & Trace**: Shows logistics milestones (4 confirmed, 3 pending) and 5 events
- [ ] **Compliance → Risk**: Shows risk assessment with charts and AI insights
- [ ] **Trade Trends**: Shows AI-driven market intelligence with insights and forecasts

### Financier Role
- [ ] **Capital Console**: Dashboard loads with funding overview
- [ ] **Funding Desk**: Shows pending funding requests
- [ ] **Deal Assistant**: Chat interface for deal analysis

### Acceptance Criteria
1. No 404 errors on any navigation link
2. All tabs render without blank screens
3. Demo data populates immediately after "Load Demo Data" click
4. AI chat responds (either real OpenAI or demo fallback) within 12 seconds
5. Track & Trace timeline shows shipment progress with events
6. Risk Assessment shows radar chart and category breakdown
7. Compliance shows at least one finding with missing items (for passport demo)