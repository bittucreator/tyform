# Tyform Architecture

A modern, Typeform-like form builder built with Next.js 16, Supabase, and React 19.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Runtime | React 19.2.3, TypeScript 5 |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| State | Zustand |
| UI | Radix UI, Tailwind CSS 4, Phosphor Icons |
| Payments | Dodo Payments |
| Email | Unosend |
| Docs | Fumadocs |
| Animations | Framer Motion |
| Charts | Recharts |

---

## Project Structure

```text
tyform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # OAuth callback routes
│   │   ├── (dashboard)/        # Authenticated dashboard pages
│   │   │   ├── analytics/      # Global analytics
│   │   │   ├── api/            # API keys management
│   │   │   ├── billing/        # Subscription & payments
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── domains/        # Custom domains
│   │   │   ├── forms/[id]/     # Form management (responses, settings, etc.)
│   │   │   ├── members/        # Team members
│   │   │   ├── settings/       # User settings
│   │   │   └── templates/      # Form templates gallery
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Auth endpoints
│   │   │   ├── billing/        # Checkout, subscription, webhooks
│   │   │   ├── forms/          # CRUD forms, submit, analytics
│   │   │   ├── integrations/   # OAuth flows for integrations
│   │   │   ├── upload/         # File upload endpoints
│   │   │   ├── v1/             # Public API (authenticated via API keys)
│   │   │   └── webhooks/       # Dodo payment webhooks
│   │   ├── docs/               # Fumadocs documentation
│   │   ├── f/[id]/             # Public form view (full URL)
│   │   ├── r/[shortId]/        # Public form view (short URL)
│   │   ├── login/              # Auth pages
│   │   ├── signup/
│   │   └── ...marketing        # Landing, pricing, about, etc.
│   │
│   ├── components/
│   │   ├── form-builder/       # Form creation components
│   │   │   ├── index.tsx       # Main builder layout
│   │   │   ├── canvas.tsx      # Question canvas
│   │   │   ├── question-editor.tsx
│   │   │   ├── logic-editor.tsx
│   │   │   ├── theme-editor.tsx
│   │   │   └── settings-panel.tsx
│   │   ├── form-viewer/        # Form rendering for respondents
│   │   │   ├── index.tsx       # Main viewer
│   │   │   ├── form-password-gate.tsx
│   │   │   └── powered-by-badge.tsx
│   │   ├── responses/          # Response management views
│   │   │   ├── responses-view.tsx
│   │   │   ├── insights-view.tsx
│   │   │   ├── settings-view.tsx
│   │   │   └── integrations-view.tsx
│   │   ├── ui/                 # Shadcn/Radix UI components
│   │   └── pro-feature-gate.tsx # Plan-based feature gating
│   │
│   ├── lib/
│   │   ├── supabase/           # Supabase client (server, client, admin)
│   │   ├── billing.ts          # Subscription management
│   │   ├── plans.ts            # Plan limits & features
│   │   ├── email.ts            # Unosend email sending
│   │   ├── webhooks.ts         # Webhook delivery system
│   │   ├── logic.ts            # Conditional logic evaluation
│   │   ├── templates.ts        # Form templates library
│   │   └── oauth.ts            # OAuth helpers for integrations
│   │
│   ├── store/
│   │   ├── form-builder.ts     # Zustand store for builder state
│   │   ├── workspace.ts        # Workspace/team state
│   │   └── auth.ts             # Auth state
│   │
│   └── types/
│       ├── database.ts         # Supabase types, Form, Question, etc.
│       └── oauth.ts            # OAuth provider types
│
├── supabase/
│   ├── schema.sql              # Database schema
│   └── migrations/             # SQL migrations
│
├── content/
│   └── docs/                   # MDX documentation files
│
└── public/                     # Static assets
```

---

## Database Schema

### Core Tables

| Table | Description |
| ----- | ----------- |
| `profiles` | User profiles (synced from auth.users) |
| `workspaces` | Team workspaces |
| `workspace_members` | User-workspace relationships with roles |
| `forms` | Form definitions (questions, settings, theme) |
| `responses` | Form submissions with answers & metadata |
| `domains` | Custom domains for forms |
| `domain_urls` | Form-to-domain URL mappings |
| `subscriptions` | Workspace subscription status |
| `api_keys` | API keys for public API access |
| `oauth_tokens` | OAuth tokens for integrations |
| `webhook_logs` | Webhook delivery logs |

### Key Relationships

profiles ─────┬──── workspaces (via workspace_members)
              │
              └──── forms ──── responses
                      │
                      ├──── domains ──── domain_urls
                      │
                      └──── webhook_logs

---

## Question Types

| Type | Description |
| ---- | ----------- |
| `welcome` | Welcome screen with optional image |
| `short_text` | Single-line text input |
| `long_text` | Multi-line text area |
| `email` | Email input with validation |
| `phone` | Phone number input |
| `url` | URL input with validation |
| `number` | Numeric input |
| `multiple_choice` | Single-select options |
| `checkbox` | Multi-select options |
| `dropdown` | Dropdown select |
| `rating` | Star rating (1-5) |
| `scale` | Numeric scale |
| `nps` | Net Promoter Score (0-10) |
| `slider` | Slider with min/max |
| `date` | Date picker |
| `yes_no` | Yes/No toggle |
| `file_upload` | File upload with validation |
| `signature` | Signature pad |
| `matrix` | Grid/matrix questions |
| `ranking` | Drag-to-rank options |
| `payment` | Payment collection (Stripe, Dodo, Polar) |
| `address` | Address with autocomplete |
| `calculator` | Calculated field with formula |
| `thank_you` | Thank you screen |

---

## User Flows

### Form Creation Flow

Dashboard → New Form / Template → Form Builder → Add Questions
    ↓
Configure Settings (theme, logic, integrations)
    ↓
Publish → Get Share Link / Embed Code

### Response Collection Flow

Respondent visits form URL → Password check (if enabled)
    ↓
Welcome screen → Questions (with logic jumps)
    ↓
Submit → Trigger webhooks, send emails
    ↓
Thank you screen (or redirect)

### Subscription Flow

Free plan → Click Upgrade → Select plan (monthly/yearly)
    ↓
Dodo Payments checkout → Webhook confirmation
    ↓
Pro features unlocked

---

## Feature Gating (Plans)

### Free Plan

- Unlimited forms & responses
- Basic analytics
- Webhooks
- Google Sheets, Notion, Slack, Discord integrations
- Self email notifications
- Password protection
- Close forms

### Pro Plan ($20/month)

- Remove branding
- Custom domains
- Custom CSS
- Partial submissions
- Workspaces & collaboration
- Advanced analytics (drop-off, time tracking)
- API access
- Respondent email notifications
- Premium integrations

---

## API Architecture

### Internal API (`/api/*`)

- Session-based auth via Supabase
- Used by dashboard and form builder

### Public API (`/api/v1/*`)

- API key authentication (Bearer token)
- Endpoints: forms, responses
- Rate limited

### Key Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/forms` | List user's forms |
| POST | `/api/forms` | Create form |
| PATCH | `/api/forms/[id]` | Update form |
| POST | `/api/forms/submit` | Submit response |
| GET | `/api/forms/[id]/analytics` | Get form analytics |
| POST | `/api/billing/checkout` | Start checkout |
| POST | `/api/webhooks/dodo` | Payment webhooks |

---

## Integrations

### Native Integrations

1. **Webhooks** - POST to custom URLs on response
2. **Google Sheets** - Append responses to spreadsheet
3. **Notion** - Add responses to database
4. **Slack** - Post notifications to channel
5. **Discord** - Post notifications to channel

### OAuth Flow

User clicks Connect → Redirect to provider → Callback with code
    ↓
Exchange code for tokens → Store in oauth_tokens table
    ↓
Use tokens to sync data on form submission

---

## Security

### Authentication

- Supabase Auth (email/password, OAuth)
- Row Level Security (RLS) on all tables
- Server-side session validation

### Feature Protection

- Client-side: `useProFeature` hook disables UI during loading
- Server-side: API validates subscription before allowing Pro features

### Form Access

- Password protection (optional)
- Prevent duplicate submissions (cookie-based)
- Form close by date/submission limit

---

## Email System

### Transactional Emails (Unosend)

- Workspace invitations
- Self email notifications (new response)
- Respondent email notifications (confirmation)
- Password reset

---

## Analytics

### Basic (Free)

- Response count over time
- Device/browser breakdown
- Geographic distribution

### Advanced (Pro)

- Question completion rates
- Drop-off analysis
- Time spent per question
- Funnel visualization

---

## Deployment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://tyform.com

# Email
UNOSEND_API_KEY=
UNOSEND_FROM_EMAIL=noreply@tyform.com

# Payments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
NEXT_PUBLIC_DODO_PUBLISHABLE_KEY=

# OAuth (Integrations)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

### Build & Deploy

```bash
npm run build    # Build Next.js
npm run start    # Production server
```

Deploys to Vercel with automatic preview deployments on PR.
