# TRAIBOX

## Overview

TRAIBOX is an AI-first trade workspace application designed for managing international trade operations. It provides a trust-first chat and cards workflow spanning compliance, finance, payments, and proof management. The platform enables trade operators and financiers to plan trades, run compliance checks, manage funding, process payments, and generate verifiable proof packs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, React Context for app-level state (role/theme)
- **Styling**: Tailwind CSS v4 with CSS variables for theming, supports light/dark modes
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api/` prefix with SSE for streaming chat responses
- **AI Integration**: OpenAI GPT-4o-mini for conversational trade intelligence with intent detection
- **Build**: esbuild for production bundling with selective dependency bundling for cold start optimization

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, conversations, messages
- **Migrations**: Managed via drizzle-kit with push command

### Application Structure
- **Client**: `client/src/` - React application with pages, components, hooks
- **Server**: `server/` - Express API with routes, storage layer, OpenAI integration
- **Shared**: `shared/` - Database schema and types shared between client and server
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules

### Key Features
- **AI Chat with Bulletproof Demo Fallback**: Multi-mode streaming chat (auto, trade-plan, compliance, funding, payments, docs, contracts, track) with contextual responses. If OpenAI fails for ANY reason (429 quota, 401 auth, network errors), automatically falls back to high-quality simulated responses with action card generation
- **Role-based UI**: Dual personas (Operator vs Financier) with distinct navigation, routes, and default landing pages. Persists across refresh via localStorage
- **Trade Intelligence**: Streaming chat with "Thinking..." state, real-time action card generation with rich descriptions, and intent detection
- **My Network**: Complete 5-tab interface (Directory, Integrations, Invites, Matchmaking, Challenges) with Create/Join network actions, partner cards, privacy cues, and search
- **Finance Module**: Payments and Funding tabs with detailed views
- **Compliance & Proofs**: Multi-tab interface (Checks, Reports, Proof Packs, Anchoring)
- **Perplexity-like Sidebar**: Compact icon rail with expand/pin functionality, inline SVG logo (4-square grid), theme-aware styling

## External Dependencies

### AI Services
- **OpenAI API**: Required for chat completions and intent detection (GPT-4o-mini model)
- Environment variable: `OPENAI_API_KEY`

### Database
- **PostgreSQL**: Primary data store for users, conversations, and messages
- Environment variable: `DATABASE_URL`
- Connection pooling via node-postgres (pg)

### Authentication
- Session management via express-session with connect-pg-simple for PostgreSQL session storage
- Passport.js configured for local authentication strategy

### UI Dependencies
- Radix UI primitives for accessible components
- Lucide React for iconography
- cmdk for command palette functionality
- embla-carousel for carousel components
- react-day-picker for date selection
- recharts for data visualization
- vaul for drawer components

## Recent Changes (January 30, 2026)

### Bulletproof AI Chat Demo Fallback
- Enhanced `server/lib/openai.ts` with comprehensive error handling that catches ALL OpenAI failures (429 quota, 401 auth, network errors, server errors)
- Implemented `generateDemoResponse()` function that analyzes user queries and generates contextual responses for compliance, funding, payments, proof packs, partners, etc.
- Demo mode still generates action cards with proper intent detection, ensuring the demo never breaks
- Added enhanced intent detection with additional keywords for better action card triggering

### Trade Intelligence UI Improvements
- Added "Thinking..." indicator with spinning loader when AI is processing
- Upgraded action cards with meaningful titles and descriptions:
  - Compliance → "Run Compliance Check" with sanctions/KYC description
  - Funding → "Request Trade Funding" with LC/factoring options
  - Payment → "Create Payment Instruction" with routing details
  - Proof Pack → "Generate Proof Pack" with document package description
  - Invite Partner → "Invite Trade Partner" with network invitation flow
- Theme-aware styling using CSS variables (primary, foreground, muted-foreground)
- Premium styling: rounded-2xl cards, font-semibold headings, shadow-sm on buttons

### Role Switching Confirmation
- Operator mode: My Space, Trade Intelligence, My Network, Finance, Compliance & Proofs, Settings
- Financier mode: Capital Console, Funding Desk, Deal Assistant, Counterparties, Risk & Policy, Settlement, Evidence, Settings
- Role changes trigger navigation updates and default landing page redirects
- Persists across page refresh via localStorage

### My Network Restoration
- All 5 tabs fully functional: Directory, Integrations, Invites, Matchmaking, Challenges
- Create Network and Join Network actions in header (alongside Import)
- Directory tab includes search, partner cards with privacy cues, and Add partner functionality
- Partner cards display trust level (Verified/Partner/New), region, capabilities, and visibility (Private/Shared)

### Design System
- Logo: Inline SVG grid pattern (4 squares) in sidebar/header, theme-aware with primary color
- Premium in-between styling maintained: rounded-xl, font-semibold, precise spacing
- Consistent icon set across both roles (no regressions)