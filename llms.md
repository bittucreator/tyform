# Tyform - LLM Context File

> This file provides context for LLMs working with the Tyform codebase.

## Project Overview

Tyform is a Typeform-like form builder SaaS application. Users can create beautiful, conversational forms with conditional logic, collect responses, and integrate with third-party services.

**URL:** <https://tyform.com>
**Repo:** <https://github.com/bittucreator/tyform>

---

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19, Radix UI, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** Zustand
- **Payments:** Dodo Payments
- **Email:** Unosend
- **Icons:** Phosphor Icons
- **Docs:** Fumadocs
- **Animations:** Framer Motion
- **Charts:** Recharts

---

## Directory Structure

src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Authenticated pages (forms, billing, settings)
│   ├── api/                # API routes
│   ├── docs/               # Documentation (Fumadocs)
│   ├── f/[id]/             # Public form view
│   └── r/[shortId]/        # Short URL form view
├── components/
│   ├── form-builder/       # Form creation UI
│   ├── form-viewer/        # Form display for respondents
│   ├── responses/          # Response management views
│   └── ui/                 # Shadcn UI components
├── lib/                    # Utilities and business logic
├── store/                  # Zustand stores
└── types/                  # TypeScript types

---

## Key Files

| File | Purpose |
| ------ | --------- |
| `src/types/database.ts` | All TypeScript types for database entities |
| `src/lib/plans.ts` | Plan limits and feature definitions |
| `src/lib/billing.ts` | Subscription management functions |
| `src/store/form-builder.ts` | Zustand store for form builder state |
| `src/components/pro-feature-gate.tsx` | Pro feature gating component/hook |
| `supabase/schema.sql` | Database schema |

---

## Database Tables

- `profiles` - User profiles
- `workspaces` - Team workspaces
- `workspace_members` - User-workspace relationships
- `forms` - Form definitions with questions and settings
- `responses` - Form submissions
- `domains` - Custom domains
- `subscriptions` - Billing subscriptions
- `api_keys` - API keys for public API
- `oauth_tokens` - OAuth tokens for integrations
- `webhook_logs` - Webhook delivery logs

---

## Question Types

The `QuestionType` enum in `src/types/database.ts` defines all available question types:

- Text: `short_text`, `long_text`, `email`, `phone`, `url`, `number`
- Choice: `multiple_choice`, `checkbox`, `dropdown`, `yes_no`
- Scale: `rating`, `scale`, `nps`, `slider`
- Advanced: `date`, `file_upload`, `signature`, `matrix`, `ranking`, `payment`, `address`, `calculator`
- Screens: `welcome`, `thank_you`

---

## Form Settings

The `FormSettings` interface includes:

- **Display:** progressBar, questionNumbers, animations
- **Theme:** colors, fonts, background, button styles
- **Access:** password, close by date/submissions, prevent duplicates
- **Notifications:** self email, respondent email
- **Integrations:** webhooks, Google Sheets, Notion, Slack, Discord
- **SEO:** title, description, OG image, favicon, redirect URL
- **Pro Features:** remove branding, custom CSS, partial submissions

---

## Plans & Feature Gating

### Free Plan (default)

- Unlimited forms & responses
- Basic analytics
- Webhooks
- Google Sheets, Notion, Slack, Discord
- Self email notifications

### Pro Plan ($20/month)

- Remove "Made with Tyform" branding
- Custom domains
- Custom CSS
- Partial submissions
- Workspaces & team collaboration
- Advanced analytics
- API access
- Respondent email notifications

### How to check features

**Client-side:**

```tsx
import { useProFeature } from '@/components/pro-feature-gate'

const { shouldDisable, hasAccess, isLoading } = useProFeature('removeBranding')
```

**Server-side:**

```ts
import { hasFeature } from '@/lib/plans'

if (!hasFeature(userPlan, 'apiAccess')) {
  return { error: 'Pro required' }
}
```

---

## API Routes

### Internal (session-based auth)

- `GET/POST /api/forms` - List/create forms
- `PATCH /api/forms/[formId]` - Update form
- `POST /api/forms/submit` - Submit response
- `GET /api/forms/[formId]/analytics` - Get analytics

### Public API (API key auth)

- `GET /api/v1/forms` - List forms
- `GET /api/v1/forms/[formId]` - Get form
- `GET /api/v1/forms/[formId]/responses` - Get responses

### Billing

- `POST /api/billing/checkout` - Start Dodo checkout
- `GET /api/billing/subscription` - Get subscription status
- `POST /api/webhooks/dodo` - Dodo payment webhooks

---

## Authentication

- Supabase Auth (email/password + Google OAuth)
- Session stored in cookies
- Server components use `createClient()` from `@/lib/supabase/server`
- Client components use auth from `@/lib/supabase/client`

---

## Common Patterns

### Server Component Page

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data } = await supabase.from('forms').select('*')
  return <FormList forms={data} />
}
```

### API Route

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... logic
}
```

### Form Builder Store

```tsx
import { useFormBuilderStore } from '@/store/form-builder'

const { form, addQuestion, updateQuestion, updateSettings } = useFormBuilderStore()
```

---

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `NEXT_PUBLIC_APP_URL` (default: <http://localhost:3000>)
- `UNOSEND_API_KEY` (for emails)
- `DODO_API_KEY` (for payments)
- OAuth secrets for integrations

---

## Styling

- Tailwind CSS 4 with custom config
- CSS variables for theming in `globals.css`
- Shadcn UI components in `src/components/ui/`
- Phosphor Icons for all icons

---

## Testing Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Common Tasks

### Add a new question type

1. Add type to `QuestionType` in `src/types/database.ts`
2. Add default properties in `src/store/form-builder.ts` `createDefaultQuestion()`
3. Add renderer in `src/components/form-viewer/index.tsx`
4. Add editor in `src/components/form-builder/question-editor.tsx`

### Add a new Pro feature

1. Add to `PlanLimits` in `src/lib/plans.ts`
2. Set `false` for free, `true` for pro
3. Add upgrade message in `FEATURE_UPGRADE_MESSAGES`
4. Use `useProFeature('featureName')` in components
5. Add server-side validation in relevant API routes

### Add a new integration

1. Add OAuth routes in `src/app/api/integrations/oauth/[provider]/`
2. Add token type to `src/types/oauth.ts`
3. Add sync logic in form submission handler
4. Add UI in `src/components/responses/integrations-view.tsx`

---

## Important Conventions

1. **File naming:** kebab-case for files, PascalCase for components
2. **API errors:** Return `{ error: string }` with appropriate status code
3. **Form IDs:** UUID for database ID, nanoid for short URLs
4. **Dates:** ISO 8601 strings, timezone UTC
5. **Money:** Stored in cents (integer)
6. **Pro features:** Always validate both client AND server side

---

## URLs

- Production: <https://tyform.com>
- Docs: <https://tyform.com/docs>
- API: <https://tyform.com/api/v1>
- Form viewer: <https://tyform.com/f/[formId>] or /r/[shortId]
- X/Twitter: <https://x.com/tyforms>
- Support: <support@tyform.com>
