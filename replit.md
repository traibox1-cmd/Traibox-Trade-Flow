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
- Multi-mode AI chat (auto, trade-plan, compliance, funding, payments, docs, contracts, track)
- Role-based UI (operator vs financier personas)
- Trade network management with partner connections
- Finance module for payments and funding operations
- Assurance module for compliance checks, reports, proofs, and blockchain anchoring
- Collapsible sidebar navigation with pin functionality

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