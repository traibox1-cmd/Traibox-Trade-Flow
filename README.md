# TRAIBOX

AI-first trade workspace with compliance, finance, payments, and proofs.

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Setup

```bash
npm install
```

Set environment variables:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/traibox
JWT_SECRET=your-secret-key      # optional, defaults to dev secret
OPENAI_API_KEY=sk-...           # optional, for AI features
```

### Database

Push schema to database (creates/updates tables):
```bash
npm run db:push
```

### Run

```bash
npm run dev
```

## Authentication & Onboarding

### Architecture
- **JWT sessions** stored in `tb-session` httpOnly cookie (jose library)
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** on auth endpoints (10 req/min per IP)
- **Route protection** via Next.js middleware

### Auth API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup-quick` | POST | Quick signup (email, password, optional name/company) |
| `/api/auth/login` | POST | Login with email + password |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/me` | GET | Get current user + org info |
| `/api/auth/complete-onboarding` | POST | Complete full onboarding (company details) |
| `/api/auth/invite` | POST | Create invite for finance user |
| `/api/auth/accept-invite` | POST | Accept invite and create account |
| `/api/auth/seed-demo` | POST | Trigger demo data seeding for org |

### Onboarding Flows

**Quick Onboarding (Demo Mode)**
1. User visits `/onboarding/quick`
2. Enters email + password (optional: name, company)
3. Creates org with `onboarding_status=demo_active`
4. Seeds demo trades, parties, and finance data
5. Redirects to `/dashboard` with demo banner

**Full Onboarding (Production Mode)**
1. User visits `/onboarding/full`
2. Multi-step wizard: Company → Profile → Preferences → Invite → Review
3. Sets org to `onboarding_status=full_complete`
4. Demo banner removed, full operations unlocked

### Creating a Demo Org

```bash
# Via API
curl -X POST http://localhost:3000/api/auth/signup-quick \
  -H 'Content-Type: application/json' \
  -d '{"email": "demo@example.com", "password": "password123"}'
```

### Creating a Finance User Invite

```bash
# Must be authenticated first
curl -X POST http://localhost:3000/api/auth/invite \
  -H 'Content-Type: application/json' \
  -H 'Cookie: tb-session=<token>' \
  -d '{"email": "finance@company.com", "role": "finance"}'
```

The response includes an `inviteLink` that the finance user can use to create their account.

## Roles & Permissions

| Role | Trades | Compliance | Finance | Payment Approval | Negotiation Limits |
|------|--------|------------|---------|------------------|--------------------|
| ops | ✅ Full | ✅ Full | ✅ View | ❌ Cannot approve | ❌ Cannot set |
| finance | ✅ View | ✅ View | ✅ Full | ✅ Can approve | ✅ Can set |
| admin | ✅ Full | ✅ Full | ✅ Full | ✅ Can approve | ✅ Can set |

### Finance API Endpoints

| Endpoint | Method | Role Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/finance/policy` | GET | Any | Get org finance policy |
| `/api/v1/finance/policy` | POST | finance/admin | Set finance policy |
| `/api/v1/payments/:id/approve` | POST | finance/admin | Approve a payment |
| `/api/v1/payments/:id/reject` | POST | finance/admin | Reject a payment |

### Gating Rules
- Orgs in `demo_active` or `full_incomplete` status cannot:
  - Approve payments
  - Set negotiation limits above demo thresholds
  - Execute formal trade operations
- Demo mode allows full exploration with sample data

## Database Schema

### Tables
- `orgs` — Organizations with onboarding status and finance policy
- `users` — Users with role (ops/finance/admin) and org membership
- `invites` — Invite tokens for adding users to orgs
- `audit_logs` — Audit trail for key actions
- `trades`, `parties`, `trade_parties` — Trade data
- `documents`, `conversations`, `messages`, `chat_messages` — Supporting data

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run check        # TypeScript type checking
npm run db:push      # Push schema to database
```
