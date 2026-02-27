-- Migration 006: School Admin Dashboard & Billing Infrastructure
-- Run against Railway PostgreSQL

BEGIN;

-- ============================================
-- BUG FIXES — Missing columns referenced by existing code
-- ============================================

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE school_claims ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE school_claims ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- ============================================
-- school_admins — Links Clerk users to schools
-- ============================================

CREATE TABLE IF NOT EXISTS school_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  invited_by UUID REFERENCES school_admins(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, clerk_user_id)
);

CREATE INDEX IF NOT EXISTS idx_school_admins_clerk_user_active
  ON school_admins (clerk_user_id) WHERE is_active = true;

-- ============================================
-- school_subscriptions — One active sub per school
-- ============================================

CREATE TABLE IF NOT EXISTS school_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'growth', 'elite', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  monthly_price INTEGER NOT NULL DEFAULT 0, -- AED fils or whole AED, stored as integer
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active/trialing/past_due subscription per school
CREATE UNIQUE INDEX IF NOT EXISTS idx_school_subscriptions_active
  ON school_subscriptions (school_id)
  WHERE status IN ('active', 'trialing', 'past_due');

-- ============================================
-- school_credit_ledger — Monthly credit tracking
-- ============================================

CREATE TABLE IF NOT EXISTS school_credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES school_subscriptions(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  credits_included INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  overage_count INTEGER NOT NULL DEFAULT 0,
  overage_rate INTEGER NOT NULL DEFAULT 0, -- AED per overage enquiry
  overage_total INTEGER NOT NULL DEFAULT 0, -- total overage charges AED
  disputes_auto_credited INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, period_start)
);

-- ============================================
-- enquiry_billing_events — Individual billing events
-- ============================================

CREATE TABLE IF NOT EXISTS enquiry_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES school_credit_ledger(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'credit_used',
    'overage_charged',
    'credit_refunded',
    'disputed',
    'dispute_auto_credited',
    'dispute_pending_review',
    'duplicate_skipped',
    'free_tier_charged'
  )),
  amount INTEGER NOT NULL DEFAULT 0, -- AED
  credit_balance_after INTEGER,
  notes TEXT,
  created_by TEXT, -- clerk_user_id or 'system'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiry_billing_events_school
  ON enquiry_billing_events (school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enquiry_billing_events_enquiry
  ON enquiry_billing_events (enquiry_id);

-- ============================================
-- updated_at triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_school_admins_updated_at'
  ) THEN
    CREATE TRIGGER trg_school_admins_updated_at
      BEFORE UPDATE ON school_admins
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_school_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER trg_school_subscriptions_updated_at
      BEFORE UPDATE ON school_subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_school_credit_ledger_updated_at'
  ) THEN
    CREATE TRIGGER trg_school_credit_ledger_updated_at
      BEFORE UPDATE ON school_credit_ledger
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

COMMIT;
