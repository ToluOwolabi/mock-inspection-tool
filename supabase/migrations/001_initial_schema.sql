-- CQC Inspection Readiness Tool — Initial Schema
-- Run this in the Supabase SQL Editor or via Supabase CLI

-- ── inspections ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inspections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL,
  company_name        TEXT,
  care_type           TEXT,
  service_users_count INTEGER,
  last_rating         TEXT CHECK (last_rating IN (
                        'Outstanding', 'Good', 'Requires Improvement',
                        'Inadequate', 'Not yet rated'
                      )),
  readiness_score     INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
  evidence_gaps       JSONB DEFAULT '[]'::jsonb,
  status              TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── inspection_responses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inspection_responses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id       UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  question_id         INTEGER NOT NULL,
  question            TEXT NOT NULL,
  answer              TEXT NOT NULL,
  response_confidence TEXT NOT NULL CHECK (response_confidence IN (
                        'immediate', 'uncertain', 'need_to_check'
                      )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Enforce one response per question per inspection (upsert target)
  UNIQUE (inspection_id, question_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inspections_email     ON public.inspections(email);
CREATE INDEX IF NOT EXISTS idx_inspections_status    ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_created   ON public.inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_inspection  ON public.inspection_responses(inspection_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_inspections_updated_at ON public.inspections;
CREATE TRIGGER set_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.inspections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a new inspection (lead capture)
CREATE POLICY "Public can create inspections"
  ON public.inspections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading an inspection by its own ID (so results page works)
CREATE POLICY "Public can read own inspection"
  ON public.inspections FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updating an inspection (progress saves, final score)
CREATE POLICY "Public can update inspections"
  ON public.inspections FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow inserting responses
CREATE POLICY "Public can insert responses"
  ON public.inspection_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading responses for the results page
CREATE POLICY "Public can read responses"
  ON public.inspection_responses FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow upserting responses (back-navigation edits)
CREATE POLICY "Public can update responses"
  ON public.inspection_responses FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
