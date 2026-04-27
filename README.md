# CQC Inspection Readiness Tool

A free, 10-minute mock CQC inspection that helps care providers discover exactly where their evidence retrieval is slow — before an inspector does.

Built with Next.js 14+, Supabase, and Tailwind CSS. Lead generation happens naturally through value delivery: the tool is genuinely useful, and Supabase captures responses for follow-up.

---

## Features

- **Multi-step inspection flow** — Email capture → service context → 9 inspector-style questions → results
- **Real-time confidence tracking** — Each answer tagged as immediate / uncertain / need-to-check
- **Readiness score** — Weighted calculation across all 5 CQC key questions
- **PDF report** — Generated client-side with jsPDF; includes score gauge, strengths, gaps, and full response breakdown
- **Supabase backend** — All responses stored for lead nurturing; RLS policies allow public insert with no auth required
- **Mobile responsive** — NHS-adjacent design, accessible forms, clean progress indicators

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/ToluOwolabi/mock-inspection-tool.git
cd mock-inspection-tool
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:

```sql
-- Paste the contents of supabase/migrations/001_initial_schema.sql
```

Or if you have the Supabase CLI:

```bash
supabase db push
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase project under **Settings → API**.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database schema

### `inspections`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `email` | text | Lead email address |
| `company_name` | text | Organisation name |
| `care_type` | text | Type of care setting |
| `service_users_count` | integer | Number of people supported |
| `last_rating` | text | Most recent CQC rating |
| `readiness_score` | integer | 0–100, calculated on completion |
| `evidence_gaps` | jsonb | Array of gap theme strings |
| `status` | text | `in_progress` / `completed` / `abandoned` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |

### `inspection_responses`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `inspection_id` | uuid | FK → inspections |
| `question_id` | integer | 1–9 |
| `question` | text | Full question text |
| `answer` | text | Manager's response |
| `response_confidence` | text | `immediate` / `uncertain` / `need_to_check` |
| `created_at` | timestamptz | |

A unique constraint on `(inspection_id, question_id)` enables upsert on back-navigation.

---

## Scoring logic

```
confidence_weight = { immediate: 1.0, uncertain: 0.5, need_to_check: 0.0 }
score = round( sum(weights) / total_questions × 100 )
```

| Score | Label |
|---|---|
| 85–100 | Strong Readiness |
| 70–84 | Good Foundation |
| 50–69 | Moderate Gaps |
| 0–49 | Significant Preparation Needed |

---

## Project structure

```
app/
  page.tsx                     Landing page
  inspect/page.tsx             Multi-step inspection form (client component)
  results/[id]/page.tsx        Results — server component (fetches from Supabase)
  results/[id]/ResultsClient.tsx  Results UI + PDF download (client component)
  api/inspections/route.ts     POST: create inspection
  api/inspections/[id]/route.ts   PATCH: update inspection
  api/inspections/[id]/responses/route.ts  POST: save response (upsert)

lib/
  supabase.ts                  Supabase client
  questions.ts                 9 inspection questions
  scoring.ts                   Score calculation, labels, strengths/gaps helpers

types/index.ts                 Shared TypeScript types

supabase/migrations/
  001_initial_schema.sql       Full DB schema with RLS policies
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `GEMINI_API_KEY` | No | For the Gemini CLI tool (separate feature) |

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add the environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Other platforms

Build for production:

```bash
npm run build
npm start
```

---

## Lead data

All completed inspections are stored in Supabase with:
- Email address
- Organisation details (name, care type, service users, last rating)
- Full question-by-question responses with confidence levels
- Final readiness score and identified evidence gaps

Use the Supabase dashboard or Table Editor to view and export leads.

---

## Design

- NHS-adjacent colour palette (blues `#005EB8`, greens `#007F3B`, whites)
- Mobile-first, responsive layout
- Accessible forms with proper labels and ARIA attributes
- No dark patterns — lead capture happens after value delivery

---

## Tech stack

- **Next.js 14+** with App Router and TypeScript
- **Supabase** — database, RLS, real-time (optional admin dashboard)
- **Tailwind CSS v3** — utility-first styling
- **jsPDF** — client-side PDF generation
- **No external auth required** — anonymous usage until email capture step
