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
- **AI Chat with Bulletproof Demo Fallback**: Multi-mode streaming chat with contextual responses. Automatically falls back to high-quality simulated responses with action card generation if OpenAI fails.
- **Role-based UI**: Dual personas (Operator vs Financier) with distinct navigation, routes, and default landing pages.
- **Trade Intelligence**: Streaming chat with "Thinking..." state, real-time action card generation, and intent detection. Supports multimodal inputs (documents) and distinct "Trade" and "Explore" modes.
- **My Network**: 5-tab interface (Directory, Integrations, Invites, Matchmaking, Challenges) with network creation/joining, partner cards, and search.
- **Finance Module**: Payments and Funding tabs with detailed views and configurations (funding types, payment terms).
- **Compliance & Proofs**: Multi-tab interface (Checks, Reports, Proof Packs, Anchoring) including a new "Trade Passport" for identity/compliance verification and "Track & Trace" for logistics.
- **Logistics Tracking**: Milestone stepper for shipment tracking with events and document integration.
- **Multimodal & Document Upload**: Supports attaching documents to trades and chat, with drag-and-drop functionality and the ability to create trades from documents.
- **Perplexity-like Sidebar**: Compact icon rail with expand/pin functionality and inline SVG logo.
- **Design System**: Premium minimal design using theme-aware components, rounded elements, and consistent iconography.

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